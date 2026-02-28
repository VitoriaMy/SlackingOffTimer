import { AppLanguage, WorkSchedule } from "../lib/types";
import { isWorkDate } from "../lib/time";
import { TEXT } from "./i18n";

export const dateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const getWorkSegmentId = (date: Date, schedule: WorkSchedule): string | null => {
  const datePart = dateKey(date);
  if (!isWorkDate(date, schedule)) return null;

  const current = date.getHours() * 60 + date.getMinutes();
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  if (current < start || current >= end) return null;

  if (schedule.lunchStart && schedule.lunchEnd) {
    const lunchStart = toMinutes(schedule.lunchStart);
    const lunchEnd = toMinutes(schedule.lunchEnd);
    if (current >= lunchStart && current < lunchEnd) return null;
    if (current < lunchStart) return `${datePart}-am`;
    return `${datePart}-pm`;
  }

  return `${datePart}-full`;
};

export const normalizeSchedule = (schedule: WorkSchedule): WorkSchedule => ({
  ...schedule,
  holidays: schedule.holidays ?? [],
  dayOverrides: {
    ...(schedule.dayOverrides ?? {}),
    ...Object.fromEntries((schedule.holidays ?? []).map((date) => [date, "rest" as const]))
  }
});

export const WEEK_DAYS = [
  { value: 1, zh: "周一", en: "Mon" },
  { value: 2, zh: "周二", en: "Tue" },
  { value: 3, zh: "周三", en: "Wed" },
  { value: 4, zh: "周四", en: "Thu" },
  { value: 5, zh: "周五", en: "Fri" },
  { value: 6, zh: "周六", en: "Sat" },
  { value: 0, zh: "周日", en: "Sun" }
];

export const validateSchedule = (schedule: WorkSchedule, language: AppLanguage): string | null => {
  const text = TEXT[language];
  if (!schedule.startTime || !schedule.endTime) {
    return text.errNeedWorkTime;
  }

  if (schedule.startTime >= schedule.endTime) {
    return text.errOrderWorkTime;
  }

  const hasLunchStart = Boolean(schedule.lunchStart);
  const hasLunchEnd = Boolean(schedule.lunchEnd);

  if (hasLunchStart !== hasLunchEnd) {
    return text.errBothLunch;
  }

  if (hasLunchStart && hasLunchEnd) {
    if (schedule.lunchStart! >= schedule.lunchEnd!) {
      return text.errOrderLunch;
    }
    if (schedule.lunchStart! < schedule.startTime || schedule.lunchEnd! > schedule.endTime) {
      return text.errLunchRange;
    }
  }

  if (schedule.workDays.length === 0) {
    return text.errNeedWorkDay;
  }

  return null;
};