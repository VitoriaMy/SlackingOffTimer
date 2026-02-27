package com.slackingofftimer.poc.core

import com.slackingofftimer.poc.model.WorkSchedule
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import kotlin.math.ceil

object TimeWindow {
  private val zone: ZoneId = ZoneId.systemDefault()

  fun parseTime(value: String): LocalTime? = runCatching { LocalTime.parse(value) }.getOrNull()

  fun inWorkWindow(schedule: WorkSchedule, now: LocalDateTime = LocalDateTime.now(zone)): Boolean {
    if (!schedule.workDays.contains(now.dayOfWeek.value)) return false
    val start = parseTime(schedule.startTime) ?: return false
    val end = parseTime(schedule.endTime) ?: return false
    if (!now.toLocalTime().isInHalfOpen(start, end)) return false
    if (inRestWindow(schedule, now.toLocalTime())) return false
    return true
  }

  private fun inRestWindow(schedule: WorkSchedule, now: LocalTime): Boolean {
    if (schedule.restStart.isBlank() || schedule.restEnd.isBlank()) return false
    val restStart = parseTime(schedule.restStart) ?: return false
    val restEnd = parseTime(schedule.restEnd) ?: return false
    return now.isInHalfOpen(restStart, restEnd)
  }

  fun effectiveWorkMinutes(schedule: WorkSchedule): Int {
    val start = parseTime(schedule.startTime) ?: return 0
    val end = parseTime(schedule.endTime) ?: return 0
    if (!start.isBefore(end)) return 0
    var minutes = Duration.between(start, end).toMinutes().toInt()
    val restStart = parseTime(schedule.restStart)
    val restEnd = parseTime(schedule.restEnd)
    if (restStart != null && restEnd != null && restStart.isBefore(restEnd)) {
      minutes -= Duration.between(restStart, restEnd).toMinutes().toInt()
    }
    return minutes.coerceAtLeast(0)
  }

  fun dayKey(localDate: LocalDate): String = localDate.toString()

  fun nowDayKey(): String = dayKey(LocalDate.now(zone))

  fun afterWorkEnd(schedule: WorkSchedule, now: LocalDateTime = LocalDateTime.now(zone)): Boolean {
    val end = parseTime(schedule.endTime) ?: return false
    return schedule.workDays.contains(now.dayOfWeek.value) && !now.toLocalTime().isBefore(end)
  }

  fun overlapMillisByDay(
    schedule: WorkSchedule,
    start: Instant,
    end: Instant,
  ): Map<LocalDate, Long> {
    if (!end.isAfter(start)) return emptyMap()
    val startTime = LocalDateTime.ofInstant(start, zone)
    val endTime = LocalDateTime.ofInstant(end, zone)
    var cursor = startTime
    val result = linkedMapOf<LocalDate, Long>()
    while (cursor.isBefore(endTime)) {
      val day = cursor.toLocalDate()
      val nextDayStart = day.plusDays(1).atStartOfDay()
      val segmentEnd = minOf(endTime, nextDayStart)
      if (schedule.workDays.contains(day.dayOfWeek.value)) {
        val workStart = parseTime(schedule.startTime)
        val workEnd = parseTime(schedule.endTime)
        if (workStart != null && workEnd != null && workStart.isBefore(workEnd)) {
          val workStartDateTime = day.atTime(workStart)
          val workEndDateTime = day.atTime(workEnd)
          var workMs = overlapMillis(cursor, segmentEnd, workStartDateTime, workEndDateTime)
          if (workMs > 0 && schedule.restStart.isNotBlank() && schedule.restEnd.isNotBlank()) {
            val restStart = parseTime(schedule.restStart)
            val restEnd = parseTime(schedule.restEnd)
            if (restStart != null && restEnd != null && restStart.isBefore(restEnd)) {
              val restStartDateTime = day.atTime(restStart)
              val restEndDateTime = day.atTime(restEnd)
              workMs -= overlapMillis(cursor, segmentEnd, restStartDateTime, restEndDateTime)
            }
          }
          if (workMs > 0) {
            result[day] = (result[day] ?: 0) + workMs
          }
        }
      }
      cursor = segmentEnd
    }
    return result
  }

  fun distributeMinutesByOverlap(
    overlapByDay: Map<LocalDate, Long>,
  ): Map<LocalDate, Int> {
    val totalMs = overlapByDay.values.sum()
    if (totalMs <= 0) return emptyMap()
    val totalMinutes = maxOf(1, ceil(totalMs / 60_000.0).toInt())
    var allocated = 0
    val entries = overlapByDay.entries.toList()
    val out = linkedMapOf<LocalDate, Int>()
    entries.forEachIndexed { index, entry ->
      val minutes =
        if (index == entries.lastIndex) {
          totalMinutes - allocated
        } else {
          val value = (totalMinutes * entry.value / totalMs).toInt()
          allocated += value
          value
        }
      out[entry.key] = minutes.coerceAtLeast(0)
    }
    return out
  }

  private fun overlapMillis(
    startA: LocalDateTime,
    endA: LocalDateTime,
    startB: LocalDateTime,
    endB: LocalDateTime,
  ): Long {
    val start = maxOf(startA, startB)
    val end = minOf(endA, endB)
    if (!end.isAfter(start)) return 0
    return Duration.between(start, end).toMillis()
  }
}

private fun LocalTime.isInHalfOpen(start: LocalTime, end: LocalTime): Boolean {
  return (this == start || this.isAfter(start)) && this.isBefore(end)
}
