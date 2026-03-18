import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppLanguage,
  ScheduleHistoryRecord,
  SlackingRecord,
  WorkSchedule,
  defaultSchedule,
} from "_/types";

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

export const keepRecent7DaysRecords = (
  records: SlackingRecord[],
  now = Date.now(),
): SlackingRecord[] => {
  const threshold = now - sevenDaysMs;

  return records
    .filter(
      (record) =>
        isValidSlackingRecord(record) &&
        record.timestamp >= threshold &&
        record.timestamp <= now,
    )
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const keepRecent7DaysScheduleHistory = (
  records: ScheduleHistoryRecord[],
  now = Date.now(),
): ScheduleHistoryRecord[] => {
  const threshold = now - sevenDaysMs;

  return records
    .filter(
      (record) =>
        isValidScheduleHistoryRecord(record) &&
        record.savedAt >= threshold &&
        record.savedAt <= now,
    )
    .sort((a, b) => a.savedAt - b.savedAt);
};

export const loadLanguage = async (): Promise<AppLanguage> => {
  try {
    const value = await AsyncStorage.getItem(languageKey);
    return value === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
};

export const saveLanguage = async (language: AppLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(languageKey, language);
  } catch {
    console.warn("Failed to save language");
  }
};

export const loadConfigured = async (): Promise<boolean> => {
  try {
    const configured = await AsyncStorage.getItem(configuredKey);
    if (configured === "1") return true;
    const schedule = await AsyncStorage.getItem(scheduleKey);
    return Boolean(schedule);
  } catch {
    return false;
  }
};

export const saveConfigured = async (configured: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(configuredKey, configured ? "1" : "0");
  } catch {
    console.warn("Failed to save configured status");
  }
};

export const loadSchedule = async (): Promise<WorkSchedule> => {
  try {
    const raw = await AsyncStorage.getItem(scheduleKey);
    if (!raw) return defaultSchedule;
    return JSON.parse(raw) as WorkSchedule;
  } catch {
    return defaultSchedule;
  }
};

export const saveSchedule = async (schedule: WorkSchedule): Promise<void> => {
  try {
    await AsyncStorage.setItem(scheduleKey, JSON.stringify(schedule));
  } catch {
    console.warn("Failed to save schedule");
  }
};

export const loadSlackingRecords = async (): Promise<SlackingRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(slackingRecordsKey);
    if (!raw) return [];
    const records = JSON.parse(raw) as SlackingRecord[];
    return keepRecent7DaysRecords(records);
  } catch {
    return [];
  }
};

export const saveSlackingRecords = async (records: SlackingRecord[]): Promise<void> => {
  try {
    const keptRecords = keepRecent7DaysRecords(records);
    await AsyncStorage.setItem(slackingRecordsKey, JSON.stringify(keptRecords));
  } catch {
    console.warn("Failed to save slacking records");
  }
};

export const loadScheduleHistory = async (): Promise<ScheduleHistoryRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(scheduleHistoryKey);
    if (!raw) return [];
    const records = JSON.parse(raw) as ScheduleHistoryRecord[];
    return keepRecent7DaysScheduleHistory(records);
  } catch {
    return [];
  }
};

export const saveScheduleHistory = async (records: ScheduleHistoryRecord[]): Promise<void> => {
  try {
    const keptRecords = keepRecent7DaysScheduleHistory(records);
    await AsyncStorage.setItem(scheduleHistoryKey, JSON.stringify(keptRecords));
  } catch {
    console.warn("Failed to save schedule history");
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      scheduleKey,
      configuredKey,
      languageKey,
      slackingRecordsKey,
      scheduleHistoryKey,
    ]);
  } catch {
    console.warn("Failed to clear all data");
  }
};
