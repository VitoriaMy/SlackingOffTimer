package com.anonymous.mobile

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import org.json.JSONObject

class BackgroundUsageService : Service(), SensorEventListener {

  companion object {
    private const val CHANNEL_ID = "slacking_background_channel"
    private const val NOTIFICATION_ID = 10021
    private const val PREFS_NAME = "slacking_background_usage"
    private const val EVENTS_KEY = "events"
    private const val LAST_STATE_KEY = "last_state"

    private const val EVALUATE_INTERVAL_MS = 5000L
    private const val ACTIVE_TIMEOUT_MS = 20000L
    private const val GYRO_ACTIVITY_THRESHOLD = 0.12f

    const val ACTION_START = "com.anonymous.mobile.BG_USAGE_START"
    const val ACTION_STOP = "com.anonymous.mobile.BG_USAGE_STOP"

    fun start(context: Context) {
      val intent = Intent(context, BackgroundUsageService::class.java).apply {
        action = ACTION_START
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      val intent = Intent(context, BackgroundUsageService::class.java).apply {
        action = ACTION_STOP
      }
      context.startService(intent)
    }
  }

  private val handler = Handler(Looper.getMainLooper())
  private var lastActiveAt: Long = System.currentTimeMillis()
  private var currentState: Int = 0

  private var sensorManager: SensorManager? = null
  private var gyroscope: Sensor? = null

  private val evaluator = object : Runnable {
    override fun run() {
      evaluateAndPersistState()
      handler.postDelayed(this, EVALUATE_INTERVAL_MS)
    }
  }

  private val screenReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      when (intent?.action) {
        Intent.ACTION_USER_PRESENT -> {
          // 手机解锁 → 摸鱼状态
          lastActiveAt = System.currentTimeMillis()
          updateState(1)
        }
        Intent.ACTION_SCREEN_OFF -> {
          // 手机锁屏 → 停止摸鱼
          updateState(0)
        }
        Intent.ACTION_SCREEN_ON -> {
          // 屏幕打开，使用陀螺仪辅助判断
          lastActiveAt = System.currentTimeMillis()
          evaluateAndPersistState()
        }
      }
    }
  }

  override fun onBind(intent: Intent?): IBinder? {
    return null
  }

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()

    currentState = getPrefs().getInt(LAST_STATE_KEY, 0)

    sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
    gyroscope = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
    gyroscope?.let {
      sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
    }

    val filter = IntentFilter().apply {
      addAction(Intent.ACTION_USER_PRESENT)
      addAction(Intent.ACTION_SCREEN_ON)
      addAction(Intent.ACTION_SCREEN_OFF)
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(screenReceiver, filter, RECEIVER_NOT_EXPORTED)
    } else {
      registerReceiver(screenReceiver, filter)
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> {
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        return START_NOT_STICKY
      }
      else -> {
        startForeground(NOTIFICATION_ID, buildNotification())
        handler.removeCallbacks(evaluator)
        handler.post(evaluator)
      }
    }

    return START_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacks(evaluator)
    sensorManager?.unregisterListener(this)
    unregisterReceiver(screenReceiver)
    super.onDestroy()
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
    // no-op
  }

  override fun onSensorChanged(event: SensorEvent?) {
    if (event == null || event.sensor.type != Sensor.TYPE_GYROSCOPE) {
      return
    }

    val x = event.values.getOrNull(0) ?: 0f
    val y = event.values.getOrNull(1) ?: 0f
    val z = event.values.getOrNull(2) ?: 0f
    val movement = kotlin.math.abs(x) + kotlin.math.abs(y) + kotlin.math.abs(z)
    if (movement >= GYRO_ACTIVITY_THRESHOLD) {
      lastActiveAt = System.currentTimeMillis()
    }
  }

  private fun evaluateAndPersistState(forceInactive: Boolean = false) {
    val now = System.currentTimeMillis()
    val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
    val isInteractive = powerManager.isInteractive
    val recentlyActive = now - lastActiveAt <= ACTIVE_TIMEOUT_MS
    
    // 屏幕打开 && 最近有陀螺仪活动 → 摸鱼状态 1
    // 屏幕打开 || 最近无陀螺仪活动 → 停止摸鱼 0
    val nextState = if (!forceInactive && isInteractive && recentlyActive) 1 else 0

    if (nextState == currentState) {
      return
    }

    currentState = nextState
    getPrefs().edit().putInt(LAST_STATE_KEY, currentState).apply()
    appendEvent(now, currentState)
  }

  private fun updateState(newState: Int) {
    if (newState == currentState) {
      return
    }

    val now = System.currentTimeMillis()
    currentState = newState
    getPrefs().edit().putInt(LAST_STATE_KEY, currentState).apply()
    appendEvent(now, currentState)
  }

  private fun appendEvent(timestamp: Long, switchState: Int) {
    val prefs = getPrefs()
    val current = loadEvents(prefs)
    val event = JSONObject().apply {
      put("timestamp", timestamp)
      put("switchState", switchState)
    }
    current.put(event)

    // Keep the queue bounded to avoid unbounded growth.
    val bounded = JSONArray()
    val start = kotlin.math.max(0, current.length() - 1000)
    for (index in start until current.length()) {
      bounded.put(current.get(index))
    }

    prefs.edit().putString(EVENTS_KEY, bounded.toString()).apply()
  }

  private fun buildNotification(): Notification {
    val intent = Intent(this, MainActivity::class.java)
    val pendingIntent = PendingIntent.getActivity(
      this,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle(getString(R.string.bg_usage_notification_title))
      .setContentText(getString(R.string.bg_usage_notification_body))
      .setSmallIcon(R.mipmap.ic_launcher)
      .setOngoing(true)
      .setContentIntent(pendingIntent)
      .build()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(
      CHANNEL_ID,
      getString(R.string.bg_usage_channel_name),
      NotificationManager.IMPORTANCE_LOW,
    )
    manager.createNotificationChannel(channel)
  }

  private fun getPrefs() = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  private fun loadEvents(prefs: android.content.SharedPreferences): JSONArray {
    val raw = prefs.getString(EVENTS_KEY, "[]") ?: "[]"
    return try {
      JSONArray(raw)
    } catch (_: Throwable) {
      JSONArray()
    }
  }
}
