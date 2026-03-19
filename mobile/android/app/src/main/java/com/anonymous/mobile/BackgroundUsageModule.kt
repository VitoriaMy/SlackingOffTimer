package com.anonymous.mobile

import android.content.Context
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
}
