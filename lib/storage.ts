import { DailyStat, WorkSchedule, defaultSchedule } from "@/lib/types";

const scheduleKey = "slacking_schedule";
const statsKey = "slacking_daily_stats";

export const loadSchedule = (): WorkSchedule => {
  if (typeof window === "undefined") return defaultSchedule;
  const raw = window.localStorage.getItem(scheduleKey);
  if (!raw) return defaultSchedule;
  try {
    return JSON.parse(raw) as WorkSchedule;
  } catch {
    return defaultSchedule;
  }
};

export const saveSchedule = (schedule: WorkSchedule): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scheduleKey, JSON.stringify(schedule));
};

export const loadStats = (): DailyStat[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(statsKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DailyStat[];
  } catch {
    return [];
  }
};

export const upsertTodayStat = (newStat: DailyStat): DailyStat[] => {
  const all = loadStats();
  const filtered = all.filter((s) => s.date !== newStat.date);
  const updated = [...filtered, newStat].sort((a, b) => a.date.localeCompare(b.date));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(statsKey, JSON.stringify(updated));
  }
  return updated;
};
