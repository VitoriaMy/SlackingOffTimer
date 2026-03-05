import { WorkSchedule } from "./types";

const toMinutes = (hhmm: string): number => {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
};

export const isWorkDate = (date: Date, schedule: WorkSchedule): boolean => {
  const day = date.getDay();
  return schedule.workDays.includes(day);
};

export const isWorkWindow = (date: Date, schedule: WorkSchedule): boolean => {
  if (!isWorkDate(date, schedule)) return false;
  const current = date.getHours() * 60 + date.getMinutes();
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  if (current < start || current >= end) return false;

  if (schedule.lunchStart && schedule.lunchEnd) {
    const lunchStart = toMinutes(schedule.lunchStart);
    const lunchEnd = toMinutes(schedule.lunchEnd);
    if (current >= lunchStart && current < lunchEnd) return false;
  }

  return true;
};
