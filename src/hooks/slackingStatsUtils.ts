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

export function computeDurationMsByRecords(
  records: SlackingRecord[],
  range: DayRange,
  nowMs = Date.now(),
): number {
  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);

  let total = 0;
  let activeStart: number | null = null;

  for (const record of sortedRecords) {
    if (record.switchState === 1) {
      if (activeStart === null) {
        activeStart = record.timestamp;
      }
      continue;
    }

    if (activeStart !== null) {
      total += Math.max(0, record.timestamp - activeStart);
      activeStart = null;
    }
  }

  if (activeStart !== null) {
    const endBoundary = nowMs >= range.start && nowMs <= range.end ? nowMs : range.end;
    total += Math.max(0, endBoundary - activeStart);
  }

  return total;
}

export function toRatio(durationMs: number, plannedWorkMs: number): number {
  if (plannedWorkMs <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (durationMs / plannedWorkMs) * 100));
}
