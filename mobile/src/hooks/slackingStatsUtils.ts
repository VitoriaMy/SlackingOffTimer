import type { AppLanguage, ScheduleHistoryRecord, SlackingRecord, WorkSchedule } from "@/core/types";

const toLocale = (language: AppLanguage): string => (language === "zh" ? "zh-CN" : "en-US");

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
  const lunchMinutes =
    schedule.lunchStart && schedule.lunchEnd
      ? Math.max(0, toMinutes(schedule.lunchEnd) - toMinutes(schedule.lunchStart))
      : 0;
  return Math.max(0, workMinutes - lunchMinutes) * 60 * 1000;
}

export function formatDurationHours(durationMs: number, language: AppLanguage): string {
  const hours = durationMs / (60 * 60 * 1000);
  const display = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return language === "zh" ? `${display}小时` : `${display}h`;
}

export function formatDurationHms(durationMs: number, language: AppLanguage): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (language === "zh") {
    return `${String(hours).padStart(2, "0")}时${String(minutes).padStart(2, "0")}分${String(seconds).padStart(2, "0")}秒`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatDayLabel(dayKey: string, language: AppLanguage): string {
  const date = new Date(`${dayKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dayKey;
  }

  const locale = toLocale(language);
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(timestamp: number, language: AppLanguage): string {
  return new Intl.DateTimeFormat(toLocale(language), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: language === "en",
  }).format(new Date(timestamp));
}

export function formatDate(timestamp: number, language: AppLanguage): string {
  return new Intl.DateTimeFormat(toLocale(language), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

export function formatPercent(value: number, language: AppLanguage, fractionDigits = 1): string {
  const normalized = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(toLocale(language), {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(normalized / 100);
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

function computeSegmentDurationMs(segment: TimeRange, lunchRange: TimeRange | null): number {
  const raw = Math.max(0, segment.end - segment.start);
  if (!lunchRange || raw <= 0) {
    return raw;
  }

  const overlap = Math.max(0, Math.min(segment.end, lunchRange.end) - Math.max(segment.start, lunchRange.start));
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
      total += computeSegmentDurationMs({ start: activeStart, end: record.timestamp }, lunchRange);
      activeStart = null;
    }
  }

  if (activeStart !== null) {
    const endBoundary = nowMs >= range.start && nowMs <= range.end ? nowMs : range.end;
    total += computeSegmentDurationMs({ start: activeStart, end: endBoundary }, lunchRange);
  }

  return total;
}

export function toRatio(durationMs: number, plannedWorkMs: number): number {
  if (plannedWorkMs <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (durationMs / plannedWorkMs) * 100));
}
