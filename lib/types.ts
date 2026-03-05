export type WorkSchedule = {
  workDays: number[];
  startTime: string;
  endTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  holidays?: string[];
  dayOverrides?: Record<string, "work" | "rest">;
};

export type AppLanguage = "zh" | "en";

export const defaultSchedule: WorkSchedule = {
  workDays: [1, 2, 3, 4, 5],
  startTime: "09:30",
  endTime: "18:30",
  lunchStart: "12:00",
  lunchEnd: "13:00",
  holidays: [],
  dayOverrides: {}
};
