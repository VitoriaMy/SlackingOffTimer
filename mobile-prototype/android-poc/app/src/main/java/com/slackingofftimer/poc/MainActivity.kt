package com.slackingofftimer.poc

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.slackingofftimer.poc.model.AppConfig
import com.slackingofftimer.poc.service.SlackingForegroundService
import com.slackingofftimer.poc.store.LocalStore

class MainActivity : AppCompatActivity() {
  private lateinit var store: LocalStore
  private lateinit var statusText: TextView

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    store = LocalStore(this)
    ensureDefaultConfig()
    requestNotificationPermissionIfNeeded()

    statusText = findViewById(R.id.statusText)
    val startButton = findViewById<Button>(R.id.startServiceButton)
    val stopButton = findViewById<Button>(R.id.stopServiceButton)
    val pushButton = findViewById<Button>(R.id.togglePushButton)

    startButton.setOnClickListener {
      ContextCompat.startForegroundService(
        this,
        Intent(this, SlackingForegroundService::class.java),
      )
      renderStatus()
    }
    stopButton.setOnClickListener {
      stopService(Intent(this, SlackingForegroundService::class.java))
      renderStatus()
    }
    pushButton.setOnClickListener {
      val config = store.loadConfig()
      store.saveConfig(config.copy(pushEnabled = !config.pushEnabled))
      renderStatus()
    }

    renderStatus()
  }

  private fun ensureDefaultConfig() {
    val config = store.loadConfig()
    if (config.configured) return
    store.saveConfig(AppConfig(configured = true, pushEnabled = false))
  }

  private fun renderStatus() {
    val config = store.loadConfig()
    val today = store.todayStat(config)
    val ratio =
      if (today.effectiveWorkMinutes > 0) {
        (today.fishMinutes * 100 / today.effectiveWorkMinutes)
      } else {
        0
      }
    statusText.text =
      """
      原型状态：
      - 服务：可手动启动/停止
      - 推送：${if (config.pushEnabled) "已开启" else "未开启"}
      - 今日摸鱼：${today.fishMinutes} 分钟
      - 今日占比：$ratio%
      """.trimIndent()
  }

  private fun requestNotificationPermissionIfNeeded() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
    ActivityCompat.requestPermissions(
      this,
      arrayOf(Manifest.permission.POST_NOTIFICATIONS),
      100,
    )
  }
}
