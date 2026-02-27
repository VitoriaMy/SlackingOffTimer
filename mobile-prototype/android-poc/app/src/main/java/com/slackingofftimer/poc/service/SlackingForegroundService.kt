package com.slackingofftimer.poc.service

import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import com.slackingofftimer.poc.core.TimeWindow
import com.slackingofftimer.poc.store.LocalStore

class SlackingForegroundService : Service() {
  private lateinit var store: LocalStore
  private lateinit var engine: SessionEngine
  private val mainHandler = Handler(Looper.getMainLooper())

  private val ticker =
    object : Runnable {
      override fun run() {
        val config = store.loadConfig()
        engine.onTick(config)
        maybePushDailySummary()
        mainHandler.postDelayed(this, 30_000L)
      }
    }

  private val screenReceiver =
    object : BroadcastReceiver() {
      override fun onReceive(
        context: Context?,
        intent: Intent?,
      ) {
        val action = intent?.action ?: return
        val config = store.loadConfig()
        when (action) {
          Intent.ACTION_USER_PRESENT -> engine.onUnlock(config)
          Intent.ACTION_SCREEN_OFF -> engine.onScreenOff(config)
        }
      }
    }

  override fun onCreate() {
    super.onCreate()
    store = LocalStore(applicationContext)
    engine = SessionEngine(store)
    SummaryNotifier.ensureChannels(this)
    registerReceiver(
      screenReceiver,
      IntentFilter().apply {
        addAction(Intent.ACTION_USER_PRESENT)
        addAction(Intent.ACTION_SCREEN_OFF)
      },
    )
    mainHandler.post(ticker)
  }

  override fun onStartCommand(
    intent: Intent?,
    flags: Int,
    startId: Int,
  ): Int {
    startForeground(
      SummaryNotifier.FOREGROUND_NOTIFICATION_ID,
      SummaryNotifier.buildForeground(this),
    )
    return START_STICKY
  }

  override fun onDestroy() {
    val config = store.loadConfig()
    engine.stopAndSettle(config)
    runCatching { unregisterReceiver(screenReceiver) }
    mainHandler.removeCallbacksAndMessages(null)
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun maybePushDailySummary() {
    val config = store.loadConfig()
    if (!config.pushEnabled) return
    if (!TimeWindow.afterWorkEnd(config.schedule)) return
    val today = TimeWindow.nowDayKey()
    if (store.lastSummarySentDay() == today) return

    val todayStat = store.todayStat(config)
    SummaryNotifier.notifyDailySummary(this, todayStat)
    store.markSummarySent(today)
  }
}
