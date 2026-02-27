package com.slackingofftimer.poc.service

import com.slackingofftimer.poc.core.TimeWindow
import com.slackingofftimer.poc.model.AppConfig
import com.slackingofftimer.poc.store.LocalStore
import java.time.Instant

class SessionEngine(
  private val store: LocalStore,
) {
  private var sessionStart: Instant? = null

  fun onUnlock(config: AppConfig) {
    if (!config.configured) return
    if (!TimeWindow.inWorkWindow(config.schedule)) return
    if (sessionStart == null) sessionStart = Instant.now()
  }

  fun onScreenOff(config: AppConfig) {
    stopAndSettle(config)
  }

  fun onTick(config: AppConfig) {
    if (!config.configured) return
    if (!TimeWindow.inWorkWindow(config.schedule)) {
      stopAndSettle(config)
      return
    }
    if (sessionStart == null) {
      // 如果服务在工作窗口内启动，默认开始会话，覆盖“应用已解锁但广播未触发”场景。
      sessionStart = Instant.now()
    }
  }

  fun stopAndSettle(config: AppConfig) {
    val start = sessionStart ?: return
    val end = Instant.now()
    if (!end.isAfter(start)) {
      sessionStart = null
      return
    }
    val overlaps = TimeWindow.overlapMillisByDay(config.schedule, start, end)
    val allocations = TimeWindow.distributeMinutesByOverlap(overlaps)
    val effective = TimeWindow.effectiveWorkMinutes(config.schedule)
    allocations.forEach { (day, minutes) ->
      store.incrementFishMinutes(day.toString(), minutes, effective)
    }
    sessionStart = null
  }
}
