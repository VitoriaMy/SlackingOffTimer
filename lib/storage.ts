import { AppLanguage, ScheduleHistoryRecord, SlackingRecord, WorkSchedule, defaultSchedule } from "./types";

const scheduleKey = "slacking_schedule";
const configuredKey = "slacking_configured";
const languageKey = "slacking_language";
const slackingRecordsKey = "slacking_records";
const scheduleHistoryKey = "slacking_schedule_history";
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

function isValidWorkSchedule(input: unknown): input is WorkSchedule {
  if (!input || typeof input !== "object") {
    return false;
  }

  const candidate = input as Record<string, unknown>;
  return (
    typeof candidate.startTime === "string" &&
    typeof candidate.endTime === "string" &&
    Array.isArray(candidate.workDays)
  );
}

function isValidScheduleHistoryRecord(record: unknown): record is ScheduleHistoryRecord {
  if (!record || typeof record !== "object") {
    return false;
  }

  const candidate = record as Record<string, unknown>;
  return (
    typeof candidate.savedAt === "number" &&
    Number.isFinite(candidate.savedAt) &&
    isValidWorkSchedule(candidate.schedule)
  );
}

export const keepRecent7DaysRecords = (records: SlackingRecord[], now = Date.now()): SlackingRecord[] => {
  const threshold = now - sevenDaysMs;

  return records
    .filter((record) => isValidSlackingRecord(record) && record.timestamp >= threshold && record.timestamp <= now)
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const keepRecent7DaysScheduleHistory = (
  records: ScheduleHistoryRecord[],
  now = Date.now(),
): ScheduleHistoryRecord[] => {
  const threshold = now - sevenDaysMs;

  return records
    .filter((record) => isValidScheduleHistoryRecord(record) && record.savedAt >= threshold && record.savedAt <= now)
    .sort((a, b) => a.savedAt - b.savedAt);
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

export const loadScheduleHistory = (): ScheduleHistoryRecord[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(scheduleHistoryKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return keepRecent7DaysScheduleHistory(parsed as ScheduleHistoryRecord[]);
  } catch {
    return [];
  }
};

export const saveScheduleHistory = (records: ScheduleHistoryRecord[]): void => {
  if (typeof window === "undefined") return;
  const normalized = keepRecent7DaysScheduleHistory(records);
  window.localStorage.setItem(scheduleHistoryKey, JSON.stringify(normalized));
};
