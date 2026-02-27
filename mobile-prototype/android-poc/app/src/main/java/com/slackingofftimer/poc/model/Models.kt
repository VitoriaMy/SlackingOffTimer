package com.slackingofftimer.poc.model

data class WorkSchedule(
  val workDays: Set<Int> = setOf(1, 2, 3, 4, 5), // 1=Mon ... 7=Sun
  val startTime: String = "09:00",
  val endTime: String = "18:00",
  val restStart: String = "",
  val restEnd: String = "",
)

data class AppConfig(
  val configured: Boolean = false,
  val pushEnabled: Boolean = false,
  val schedule: WorkSchedule = WorkSchedule(),
)

data class DailyStat(
  val date: String, // yyyy-MM-dd
  val fishMinutes: Int,
  val effectiveWorkMinutes: Int,
)
