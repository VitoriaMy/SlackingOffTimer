package com.slackingofftimer.poc.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.slackingofftimer.poc.R
import com.slackingofftimer.poc.model.DailyStat
import kotlin.math.roundToInt

object SummaryNotifier {
  const val FOREGROUND_CHANNEL_ID = "sot_foreground"
  const val SUMMARY_CHANNEL_ID = "sot_summary"
  const val FOREGROUND_NOTIFICATION_ID = 1001
  const val SUMMARY_NOTIFICATION_ID = 1002

  fun ensureChannels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val fgChannel =
      NotificationChannel(
        FOREGROUND_CHANNEL_ID,
        "SlackingOffTimer 运行中",
        NotificationManager.IMPORTANCE_LOW,
      )
    val summaryChannel =
      NotificationChannel(
        SUMMARY_CHANNEL_ID,
        "摸鱼小计推送",
        NotificationManager.IMPORTANCE_DEFAULT,
      )
    manager.createNotificationChannel(fgChannel)
    manager.createNotificationChannel(summaryChannel)
  }

  fun buildForeground(context: Context): Notification {
    return NotificationCompat.Builder(context, FOREGROUND_CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_media_play)
      .setContentTitle("SlackingOffTimer 运行中")
      .setContentText("工作窗口内将自动记录摸鱼时长")
      .setOngoing(true)
      .build()
  }

  fun notifyDailySummary(
    context: Context,
    stat: DailyStat,
  ) {
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val ratio =
      if (stat.effectiveWorkMinutes > 0) {
        ((stat.fishMinutes * 100.0) / stat.effectiveWorkMinutes).roundToInt()
      } else {
        0
      }
    val body = "摸鱼时长 ${formatMinutes(stat.fishMinutes)}，摸鱼占比 $ratio%"
    val notification =
      NotificationCompat.Builder(context, SUMMARY_CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_dialog_info)
        .setContentTitle("推送：摸鱼小计")
        .setContentText(body)
        .setStyle(NotificationCompat.BigTextStyle().bigText(body))
        .setAutoCancel(true)
        .build()
    manager.notify(SUMMARY_NOTIFICATION_ID, notification)
  }

  private fun formatMinutes(minutes: Int): String {
    val safe = minutes.coerceAtLeast(0)
    val h = safe / 60
    val m = safe % 60
    return when {
      h == 0 -> "${m}分钟"
      m == 0 -> "${h}小时"
      else -> "${h}小时${m}分钟"
    }
  }
}
