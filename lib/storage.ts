import { AppLanguage, WorkSchedule, defaultSchedule } from "./types";

const scheduleKey = "slacking_schedule";
const configuredKey = "slacking_configured";
const languageKey = "slacking_language";

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
