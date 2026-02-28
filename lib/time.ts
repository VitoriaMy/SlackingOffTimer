import { AppLanguage, WorkSchedule } from "./types";

const formatDateKey = (date: Date): string =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;

export const isWorkDate = (date: Date, schedule: WorkSchedule): boolean => {
  const dateKey = formatDateKey(date);
  const override = schedule.dayOverrides?.[dateKey];
  if (override === "work") return true;
  if (override === "rest") return false;

  if (schedule.holidays?.includes(dateKey)) return false;
  return schedule.workDays.includes(date.getDay());
};

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const getEffectiveWorkMinutes = (schedule: WorkSchedule): number => {
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  const total = Math.max(0, end - start);

  if (!schedule.lunchStart || !schedule.lunchEnd) {
    return total;
  }

  const lunchStart = toMinutes(schedule.lunchStart);
  const lunchEnd = toMinutes(schedule.lunchEnd);
  const lunch = Math.max(0, lunchEnd - lunchStart);
  return Math.max(0, total - lunch);
};

export const formatMinutes = (total: number, language: AppLanguage = "zh"): string => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (language === "en") {
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  }
  if (h === 0) return `${m} 分钟`;
  return `${h} 小时 ${m} 分钟`;
};

export const isWorkWindow = (date: Date, schedule: WorkSchedule): boolean => {
  if (!isWorkDate(date, schedule)) return false;

  const now = date.getHours() * 60 + date.getMinutes();
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  if (now < start || now >= end) return false;

  if (schedule.lunchStart && schedule.lunchEnd) {
    const lunchStart = toMinutes(schedule.lunchStart);
    const lunchEnd = toMinutes(schedule.lunchEnd);
    if (now >= lunchStart && now < lunchEnd) return false;
  }

  return true;
};

export const computeRatio = (fishMinutes: number, workMinutes: number): number => {
  if (workMinutes <= 0) return 0;
  return Number(((fishMinutes / workMinutes) * 100).toFixed(1));
};
