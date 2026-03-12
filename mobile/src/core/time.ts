import { WorkSchedule } from "@/core/types";

const toMinutes = (hhmm: string): number => {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
};

const dateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isWorkDate = (date: Date, schedule: WorkSchedule): boolean => {
  const key = dateKey(date);
  const override = schedule.dayOverrides?.[key];
  if (override === "work") {
    return true;
  }
  if (override === "rest") {
    return false;
  }

  if (schedule.holidays?.includes(key)) {
    return false;
  }

  return schedule.workDays.includes(date.getDay());
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
