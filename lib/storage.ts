import { AppLanguage, SlackingRecord, WorkSchedule, defaultSchedule } from "./types";

const scheduleKey = "slacking_schedule";
const configuredKey = "slacking_configured";
const languageKey = "slacking_language";
const slackingRecordsKey = "slacking_records";
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

function isValidSlackingRecord(record: unknown): record is SlackingRecord {
  if (!record || typeof record !== "object") {
    return false;
  }

  const candidate = record as Record<string, unknown>;
  return (
    typeof candidate.timestamp === "number" &&
    Number.isFinite(candidate.timestamp) &&
    (candidate.switchState === 0 || candidate.switchState === 1)
  );
}

export const keepRecent7DaysRecords = (records: SlackingRecord[], now = Date.now()): SlackingRecord[] => {
  const threshold = now - sevenDaysMs;

  return records
    .filter((record) => isValidSlackingRecord(record) && record.timestamp >= threshold && record.timestamp <= now)
    .sort((a, b) => a.timestamp - b.timestamp);
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

export const loadSlackingRecords = (): SlackingRecord[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(slackingRecordsKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return keepRecent7DaysRecords(parsed as SlackingRecord[]);
  } catch {
    return [];
  }
};

export const saveSlackingRecords = (records: SlackingRecord[]): void => {
  if (typeof window === "undefined") return;
  const normalized = keepRecent7DaysRecords(records);
  window.localStorage.setItem(slackingRecordsKey, JSON.stringify(normalized));
};
