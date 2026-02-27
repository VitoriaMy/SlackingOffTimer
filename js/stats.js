import {
  effectiveWorkMinutes,
  getDateKey,
  isWorkDay,
  minutesFromTimeString,
} from "./schedule.js";
import { loadStats, saveStats } from "./storage.js";

function overlapMs(startA, endA, startB, endB) {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function nextDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
}

function computeWorkOverlapByDay(schedule, startMs, endMs) {
  const result = {};
  let cursor = startMs;
  while (cursor < endMs) {
    const dayDate = new Date(cursor);
    const dayStart = startOfDay(dayDate).getTime();
    const dayEnd = nextDay(dayDate).getTime();
    const segmentEnd = Math.min(endMs, dayEnd);
    if (isWorkDay(schedule, dayDate)) {
      const workStartMinutes = minutesFromTimeString(schedule.startTime);
      const workEndMinutes = minutesFromTimeString(schedule.endTime);
      if (!Number.isNaN(workStartMinutes) && !Number.isNaN(workEndMinutes) && workStartMinutes < workEndMinutes) {
        const workStartMs = dayStart + workStartMinutes * 60_000;
        const workEndMs = dayStart + workEndMinutes * 60_000;
        let segmentWorkMs = overlapMs(cursor, segmentEnd, workStartMs, workEndMs);
        if (segmentWorkMs > 0 && schedule.restStart && schedule.restEnd) {
          const restStartMinutes = minutesFromTimeString(schedule.restStart);
          const restEndMinutes = minutesFromTimeString(schedule.restEnd);
          if (!Number.isNaN(restStartMinutes) && !Number.isNaN(restEndMinutes) && restStartMinutes < restEndMinutes) {
            const restStartMs = dayStart + restStartMinutes * 60_000;
            const restEndMs = dayStart + restEndMinutes * 60_000;
            segmentWorkMs -= overlapMs(cursor, segmentEnd, restStartMs, restEndMs);
          }
        }
        if (segmentWorkMs > 0) {
          const key = getDateKey(dayDate);
          result[key] = (result[key] || 0) + segmentWorkMs;
        }
      }
    }
    cursor = segmentEnd;
  }
  return result;
}

function allocateSessionMinutes(overlapByDay, totalMinutes) {
  const entries = Object.entries(overlapByDay);
  if (!entries.length) return [];
  const totalMs = entries.reduce((sum, [, ms]) => sum + ms, 0);
  let allocated = 0;
  return entries.map(([date, ms], index) => {
    let minutes;
    if (index === entries.length - 1) {
      minutes = totalMinutes - allocated;
    } else {
      minutes = Math.floor((totalMinutes * ms) / totalMs);
      allocated += minutes;
    }
    return [date, Math.max(0, minutes)];
  });
}

export function addSessionRange(schedule, startMs, endMs) {
  if (!schedule || !startMs || !endMs || endMs <= startMs) return;
  const overlapByDay = computeWorkOverlapByDay(schedule, startMs, endMs);
  const totalOverlapMs = Object.values(overlapByDay).reduce((sum, value) => sum + value, 0);
  if (totalOverlapMs <= 0) return;

  const totalMinutes = Math.max(1, Math.ceil(totalOverlapMs / 60_000));
  const minuteAllocations = allocateSessionMinutes(overlapByDay, totalMinutes);
  if (!minuteAllocations.length) return;

  const stats = loadStats();
  minuteAllocations.forEach(([dateKey, fishMinutes]) => {
    if (fishMinutes <= 0) return;
    const existing = stats[dateKey] || {
      date: dateKey,
      fishMinutes: 0,
      effectiveWorkMinutes: effectiveWorkMinutes(schedule),
    };
    existing.fishMinutes += fishMinutes;
    existing.effectiveWorkMinutes = effectiveWorkMinutes(schedule);
    stats[dateKey] = existing;
  });
  saveStats(stats);
}

export function readTodayStat(schedule, date = new Date()) {
  const stats = loadStats();
  const key = getDateKey(date);
  const fallback = {
    date: key,
    fishMinutes: 0,
    effectiveWorkMinutes: effectiveWorkMinutes(schedule),
  };
  return stats[key] || fallback;
}

export function readRecentDays(schedule, count = 7, endDate = new Date()) {
  const stats = loadStats();
  const rows = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - i);
    const key = getDateKey(date);
    const row = stats[key] || {
      date: key,
      fishMinutes: 0,
      effectiveWorkMinutes: effectiveWorkMinutes(schedule),
    };
    rows.push(row);
  }
  return rows;
}
