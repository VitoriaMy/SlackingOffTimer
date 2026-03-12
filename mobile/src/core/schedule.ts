import { AppLanguage, WorkSchedule } from "@/core/types";
import { isWorkDate } from "@/core/time";

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
    ...Object.fromEntries((schedule.holidays ?? []).map((date) => [date, "rest" as const])),
  },
});

export const validateSchedule = (schedule: WorkSchedule, language: AppLanguage): string | null => {
  if (!schedule.startTime || !schedule.endTime) {
    return language === "zh" ? "请先设置上班时间" : "Please set work hours first";
  }

  if (schedule.startTime >= schedule.endTime) {
    return language === "zh" ? "上班开始时间必须早于结束时间" : "Work start must be earlier than end";
  }

  const hasLunchStart = Boolean(schedule.lunchStart);
  const hasLunchEnd = Boolean(schedule.lunchEnd);

  if (hasLunchStart !== hasLunchEnd) {
    return language === "zh" ? "午休开始和结束时间需要同时填写" : "Lunch start and end must both be set";
  }

  if (hasLunchStart && hasLunchEnd) {
    if (schedule.lunchStart! >= schedule.lunchEnd!) {
      return language === "zh" ? "午休开始时间必须早于结束时间" : "Lunch start must be earlier than end";
    }
    if (schedule.lunchStart! < schedule.startTime || schedule.lunchEnd! > schedule.endTime) {
      return language === "zh" ? "午休时间必须在上班时间内" : "Lunch time must be inside work hours";
    }
  }

  if (schedule.workDays.length === 0) {
    return language === "zh" ? "请至少选择一个工作日" : "Select at least one work day";
  }

  return null;
};
