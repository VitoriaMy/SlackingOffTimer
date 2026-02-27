package com.slackingofftimer.poc.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import com.slackingofftimer.poc.store.LocalStore

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(
    context: Context,
    intent: Intent,
  ) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
    val config = LocalStore(context).loadConfig()
    if (!config.configured) return
    ContextCompat.startForegroundService(
      context,
      Intent(context, SlackingForegroundService::class.java),
    )
  }
}
