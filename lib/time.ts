import { WorkSchedule } from "@/lib/types";

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const formatMinutes = (total: number): string => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} 分钟`;
  return `${h} 小时 ${m} 分钟`;
};

export const isWorkWindow = (date: Date, schedule: WorkSchedule): boolean => {
  const day = date.getDay();
  if (!schedule.workDays.includes(day)) return false;

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
