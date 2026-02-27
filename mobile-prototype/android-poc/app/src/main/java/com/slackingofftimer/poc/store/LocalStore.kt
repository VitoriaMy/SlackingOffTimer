package com.slackingofftimer.poc.store

import android.content.Context
import com.slackingofftimer.poc.core.TimeWindow
import com.slackingofftimer.poc.model.AppConfig
import com.slackingofftimer.poc.model.DailyStat
import com.slackingofftimer.poc.model.WorkSchedule
import org.json.JSONArray
import org.json.JSONObject

class LocalStore(context: Context) {
  private val prefs = context.getSharedPreferences("sot_poc", Context.MODE_PRIVATE)

  fun loadConfig(): AppConfig {
    val raw = prefs.getString(KEY_CONFIG, null) ?: return AppConfig()
    return runCatching {
      val json = JSONObject(raw)
      val scheduleObj = json.optJSONObject("schedule") ?: JSONObject()
      val workDaysArray = scheduleObj.optJSONArray("workDays") ?: JSONArray()
      val workDays = mutableSetOf<Int>()
      for (i in 0 until workDaysArray.length()) {
        val day = workDaysArray.optInt(i, -1)
        if (day in 1..7) workDays += day
      }
      AppConfig(
        configured = json.optBoolean("configured", false),
        pushEnabled = json.optBoolean("pushEnabled", false),
        schedule =
          WorkSchedule(
            workDays = if (workDays.isEmpty()) setOf(1, 2, 3, 4, 5) else workDays,
            startTime = scheduleObj.optString("startTime", "09:00"),
            endTime = scheduleObj.optString("endTime", "18:00"),
            restStart = scheduleObj.optString("restStart", ""),
            restEnd = scheduleObj.optString("restEnd", ""),
          ),
      )
    }.getOrDefault(AppConfig())
  }

  fun saveConfig(config: AppConfig) {
    val scheduleObj =
      JSONObject()
        .put("workDays", JSONArray(config.schedule.workDays.toList().sorted()))
        .put("startTime", config.schedule.startTime)
        .put("endTime", config.schedule.endTime)
        .put("restStart", config.schedule.restStart)
        .put("restEnd", config.schedule.restEnd)
    val root =
      JSONObject()
        .put("configured", config.configured)
        .put("pushEnabled", config.pushEnabled)
        .put("schedule", scheduleObj)
    prefs.edit().putString(KEY_CONFIG, root.toString()).apply()
  }

  fun incrementFishMinutes(
    dateKey: String,
    minutes: Int,
    effectiveWorkMinutes: Int,
  ) {
    if (minutes <= 0) return
    val all = loadStatsMap()
    val prev = all[dateKey] ?: DailyStat(dateKey, 0, effectiveWorkMinutes)
    all[dateKey] =
      prev.copy(
        fishMinutes = prev.fishMinutes + minutes,
        effectiveWorkMinutes = effectiveWorkMinutes,
      )
    saveStatsMap(all)
  }

  fun todayStat(config: AppConfig): DailyStat {
    val key = TimeWindow.nowDayKey()
    val all = loadStatsMap()
    return all[key] ?: DailyStat(key, 0, TimeWindow.effectiveWorkMinutes(config.schedule))
  }

  fun markSummarySent(dayKey: String) {
    prefs.edit().putString(KEY_LAST_SUMMARY_DAY, dayKey).apply()
  }

  fun lastSummarySentDay(): String = prefs.getString(KEY_LAST_SUMMARY_DAY, "") ?: ""

  private fun loadStatsMap(): MutableMap<String, DailyStat> {
    val raw = prefs.getString(KEY_STATS, null) ?: return mutableMapOf()
    return runCatching {
      val obj = JSONObject(raw)
      val map = mutableMapOf<String, DailyStat>()
      obj.keys().forEach { date ->
        val value = obj.optJSONObject(date) ?: return@forEach
        map[date] =
          DailyStat(
            date = date,
            fishMinutes = value.optInt("fishMinutes", 0),
            effectiveWorkMinutes = value.optInt("effectiveWorkMinutes", 0),
          )
      }
      map
    }.getOrDefault(mutableMapOf())
  }

  private fun saveStatsMap(map: Map<String, DailyStat>) {
    val out = JSONObject()
    map.forEach { (date, stat) ->
      out.put(
        date,
        JSONObject()
          .put("fishMinutes", stat.fishMinutes)
          .put("effectiveWorkMinutes", stat.effectiveWorkMinutes),
      )
    }
    prefs.edit().putString(KEY_STATS, out.toString()).apply()
  }

  private companion object {
    private const val KEY_CONFIG = "config"
    private const val KEY_STATS = "stats"
    private const val KEY_LAST_SUMMARY_DAY = "last_summary_day"
  }
}
