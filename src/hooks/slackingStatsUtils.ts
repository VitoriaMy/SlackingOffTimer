import type { ScheduleHistoryRecord, SlackingRecord, WorkSchedule } from "../../lib/types";

export type DayRange = {
  start: number;
  end: number;
};

export type EffectiveScheduleItem = {
  startAt: number | null;
  endAt: number | null;
  isCurrent: boolean;
  schedule: WorkSchedule;
};

type TimeRange = {
  start: number;
  end: number;
};

export function formatDayKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getDateByOffset(day: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + day);
  return date;
}

export function getDayRangeByKey(dayKey: string): DayRange | null {
  const date = new Date(`${dayKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const start = date.getTime();
  const end = start + 24 * 60 * 60 * 1000 - 1;
  return { start, end };
}

export function toMinutes(hhmm: string): number {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

export function getPlannedWorkMs(schedule: WorkSchedule): number {
  const workMinutes = Math.max(0, toMinutes(schedule.endTime) - toMinutes(schedule.startTime));
  const lunchMinutes = schedule.lunchStart && schedule.lunchEnd
    ? Math.max(0, toMinutes(schedule.lunchEnd) - toMinutes(schedule.lunchStart))
    : 0;
  return Math.max(0, workMinutes - lunchMinutes) * 60 * 1000;
}

export function formatDurationHours(durationMs: number): string {
  const hours = durationMs / (60 * 60 * 1000);
  const display = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return `${display}h`;
}

export function buildSchedulePeriods(
  schedule: WorkSchedule,
  scheduleHistory: ScheduleHistoryRecord[],
): EffectiveScheduleItem[] {
  const sorted = [...scheduleHistory].sort((a, b) => a.savedAt - b.savedAt);

  if (sorted.length === 0) {
    return [
      {
        startAt: null,
        endAt: null,
        isCurrent: true,
        schedule,
      },
    ];
  }

  return sorted.map((item, index) => {
    const next = sorted[index + 1];
    return {
      startAt: item.savedAt,
      endAt: next ? next.savedAt : null,
      isCurrent: !next,
      schedule: item.schedule,
    };
  });
}

export function findEffectiveScheduleForRange(
  schedulePeriods: EffectiveScheduleItem[],
  range: DayRange,
): EffectiveScheduleItem | null {
  const candidates = schedulePeriods.filter((item) => {
    const startAt = item.startAt ?? Number.NEGATIVE_INFINITY;
    const endAt = item.endAt ?? Number.POSITIVE_INFINITY;
    return startAt <= range.end && endAt >= range.start;
  });

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((latest, item) => {
    const latestStart = latest.startAt ?? Number.NEGATIVE_INFINITY;
    const currentStart = item.startAt ?? Number.NEGATIVE_INFINITY;
    return currentStart >= latestStart ? item : latest;
  });
}

function resolveLunchRange(range: DayRange, schedule?: WorkSchedule): TimeRange | null {
  if (!schedule?.lunchStart || !schedule?.lunchEnd) {
    return null;
  }

  const base = new Date(range.start);
  const [startHour, startMinute] = schedule.lunchStart.split(":").map(Number);
  const [endHour, endMinute] = schedule.lunchEnd.split(":").map(Number);

  const lunchStart = new Date(base);
  lunchStart.setHours(startHour, startMinute, 0, 0);

  const lunchEnd = new Date(base);
  lunchEnd.setHours(endHour, endMinute, 0, 0);

  const lunchRange: TimeRange = {
    start: lunchStart.getTime(),
    end: lunchEnd.getTime(),
  };

  if (lunchRange.end <= lunchRange.start) {
    return null;
  }

  return lunchRange;
}

function resolveWorkRange(range: DayRange, schedule?: WorkSchedule): TimeRange | null {
  if (!schedule) {
    return null;
  }

  const base = new Date(range.start);
  const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
  const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

  const workStart = new Date(base);
  workStart.setHours(startHour, startMinute, 0, 0);

  const workEnd = new Date(base);
  workEnd.setHours(endHour, endMinute, 0, 0);

  const workRange: TimeRange = {
    start: workStart.getTime(),
    end: workEnd.getTime(),
  };

  if (workRange.end <= workRange.start) {
    return null;
  }

  return workRange;
}

function isTimestampInEffectiveWorkRange(
  timestamp: number,
  workRange: TimeRange | null,
  lunchRange: TimeRange | null,
): boolean {
  if (!workRange) {
    return true;
  }

  if (timestamp < workRange.start || timestamp >= workRange.end) {
    return false;
  }

  if (!lunchRange) {
    return true;
  }

  return timestamp < lunchRange.start || timestamp >= lunchRange.end;
}

function computeSegmentDurationMs(
  segment: TimeRange,
  lunchRange: TimeRange | null,
  workRange: TimeRange | null,
): number {
  const clampedStart = workRange ? Math.max(segment.start, workRange.start) : segment.start;
  const clampedEnd = workRange ? Math.min(segment.end, workRange.end) : segment.end;
  const raw = Math.max(0, clampedEnd - clampedStart);
  if (!lunchRange || raw <= 0) {
    return raw;
  }

  const overlap = Math.max(0, Math.min(clampedEnd, lunchRange.end) - Math.max(clampedStart, lunchRange.start));
  return Math.max(0, raw - overlap);
}

export function computeDurationMsByRecords(
  records: SlackingRecord[],
  range: DayRange,
  nowMs = Date.now(),
  schedule?: WorkSchedule,
): number {
  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const lunchRange = resolveLunchRange(range, schedule);
  const workRange = resolveWorkRange(range, schedule);

  let total = 0;
  let activeStart: number | null = null;

  for (const record of sortedRecords) {
    if (!isTimestampInEffectiveWorkRange(record.timestamp, workRange, lunchRange)) {
      continue;
    }

    if (record.switchState === 1) {
      if (activeStart === null) {
        activeStart = record.timestamp;
      }
      continue;
    }

    if (activeStart !== null) {
      total += computeSegmentDurationMs({ start: activeStart, end: record.timestamp }, lunchRange, workRange);
      activeStart = null;
    }
  }

  if (activeStart !== null) {
    const endBoundary = nowMs >= range.start && nowMs <= range.end ? nowMs : range.end;
    total += computeSegmentDurationMs({ start: activeStart, end: endBoundary }, lunchRange, workRange);
  }

  return total;
}

export function toRatio(durationMs: number, plannedWorkMs: number): number {
  if (plannedWorkMs <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (durationMs / plannedWorkMs) * 100));
}
