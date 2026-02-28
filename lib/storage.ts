import { AppLanguage, DailyStat, SessionState, WorkSchedule, defaultSchedule } from "./types";

const scheduleKey = "slacking_schedule";
const statsKey = "slacking_daily_stats";
const configuredKey = "slacking_configured";
const languageKey = "slacking_language";
const sessionStateKey = "slacking_session_state";

export const loadSessionState = (): SessionState => {
  if (typeof window === "undefined") {
    return { status: 0, startAt: null, endAt: null, segmentId: null };
  }

  const raw = window.localStorage.getItem(sessionStateKey);
  if (!raw) {
    return { status: 0, startAt: null, endAt: null, segmentId: null };
  }

  try {
    const parsed = JSON.parse(raw) as SessionState;
    return {
      status: parsed.status === 1 ? 1 : 0,
      startAt: typeof parsed.startAt === "number" ? parsed.startAt : null,
      endAt: typeof parsed.endAt === "number" ? parsed.endAt : null,
      segmentId: typeof parsed.segmentId === "string" ? parsed.segmentId : null
    };
  } catch {
    return { status: 0, startAt: null, endAt: null, segmentId: null };
  }
};

export const saveSessionState = (state: SessionState): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(sessionStateKey, JSON.stringify(state));
};

export const loadLanguage = (): AppLanguage => {
  if (typeof window === "undefined") return "zh";
  const value = window.localStorage.getItem(languageKey);
  return value === "en" ? "en" : "zh";
};

export const saveLanguage = (language: AppLanguage): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(languageKey, language);
};

export const loadConfigured = (): boolean => {
  if (typeof window === "undefined") return false;
  const configured = window.localStorage.getItem(configuredKey);
  if (configured === "1") return true;
  return Boolean(window.localStorage.getItem(scheduleKey));
};

export const saveConfigured = (configured: boolean): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(configuredKey, configured ? "1" : "0");
};

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
