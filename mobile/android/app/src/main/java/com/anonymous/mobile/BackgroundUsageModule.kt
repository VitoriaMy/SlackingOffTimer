package com.anonymous.mobile

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONArray
import org.json.JSONObject

class BackgroundUsageModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

  companion object {
    private const val PREFS_NAME = "slacking_background_usage"
    private const val EVENTS_KEY = "events"
  }

  override fun getName(): String {
    return "BackgroundUsageModule"
  }

  @ReactMethod
  fun startMonitoring(promise: Promise) {
    try {
      BackgroundUsageService.start(context)
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("BG_USAGE_START_FAILED", error)
    }
  }

  @ReactMethod
  fun stopMonitoring(promise: Promise) {
    try {
      BackgroundUsageService.stop(context)
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("BG_USAGE_STOP_FAILED", error)
    }
  }

  @ReactMethod
  fun consumeEvents(promise: Promise) {
    try {
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      val raw = prefs.getString(EVENTS_KEY, "[]") ?: "[]"
      val events = try {
        JSONArray(raw)
      } catch (_: Throwable) {
        JSONArray()
      }

      val result = Arguments.createArray()
      for (index in 0 until events.length()) {
        val item = events.optJSONObject(index) ?: JSONObject()
        val switchState = item.optInt("switchState", -1)
        val timestamp = item.optLong("timestamp", -1L)

        if (timestamp > 0L && (switchState == 0 || switchState == 1)) {
          val map = Arguments.createMap()
          map.putDouble("timestamp", timestamp.toDouble())
          map.putInt("switchState", switchState)
          result.pushMap(map)
        }
      }

      prefs.edit().putString(EVENTS_KEY, "[]").apply()
      promise.resolve(result)
    } catch (error: Throwable) {
      promise.reject("BG_USAGE_CONSUME_FAILED", error)
    }
  }

  @ReactMethod
  fun isIgnoringBatteryOptimizations(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        promise.resolve(true)
        return
      }

      val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
      promise.resolve(powerManager.isIgnoringBatteryOptimizations(context.packageName))
    } catch (error: Throwable) {
      promise.reject("BG_USAGE_BATTERY_STATUS_FAILED", error)
    }
  }

  @ReactMethod
  fun requestIgnoreBatteryOptimizations(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        promise.resolve(true)
        return
      }

      val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
      if (powerManager.isIgnoringBatteryOptimizations(context.packageName)) {
        promise.resolve(true)
        return
      }

      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
        data = Uri.parse("package:${context.packageName}")
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      context.startActivity(intent)

      promise.resolve(false)
    } catch (_: Throwable) {
      try {
        val fallbackIntent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(fallbackIntent)
        promise.resolve(false)
      } catch (error: Throwable) {
        promise.reject("BG_USAGE_BATTERY_REQUEST_FAILED", error)
      }
    }
  }
}
