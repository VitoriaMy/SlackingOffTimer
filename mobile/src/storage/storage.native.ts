import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppLanguage,
  defaultSchedule,
  ScheduleHistoryRecord,
  SlackingRecord,
  WorkSchedule,
} from "@/core/types";
import { AppStorage } from "@/storage/storage";

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

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // No-op: persistence failures should not crash the app.
  }
}

export const nativeStorage: AppStorage = {
  async loadLanguage(): Promise<AppLanguage> {
    const value = await safeGetItem(languageKey);
    return value === "en" ? "en" : "zh";
  },

  async saveLanguage(language: AppLanguage): Promise<void> {
    await safeSetItem(languageKey, language);
  },

  async loadConfigured(): Promise<boolean> {
    const configured = await safeGetItem(configuredKey);
    if (configured === "1") {
      return true;
    }
    const schedule = await safeGetItem(scheduleKey);
    return Boolean(schedule);
  },

  async saveConfigured(configured: boolean): Promise<void> {
    await safeSetItem(configuredKey, configured ? "1" : "0");
  },

  async loadSchedule(): Promise<WorkSchedule> {
    const raw = await safeGetItem(scheduleKey);
    if (!raw) {
      return defaultSchedule;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!isValidWorkSchedule(parsed)) {
        return defaultSchedule;
      }
      return parsed;
    } catch {
      return defaultSchedule;
    }
  },

  async saveSchedule(schedule: WorkSchedule): Promise<void> {
    await safeSetItem(scheduleKey, JSON.stringify(schedule));
  },

  async loadSlackingRecords(): Promise<SlackingRecord[]> {
    const raw = await safeGetItem(slackingRecordsKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return keepRecent7DaysRecords(parsed as SlackingRecord[]);
    } catch {
      return [];
    }
  },

  async saveSlackingRecords(records: SlackingRecord[]): Promise<void> {
    await safeSetItem(slackingRecordsKey, JSON.stringify(keepRecent7DaysRecords(records)));
  },

  async loadScheduleHistory(): Promise<ScheduleHistoryRecord[]> {
    const raw = await safeGetItem(scheduleHistoryKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return keepRecent7DaysScheduleHistory(parsed as ScheduleHistoryRecord[]);
    } catch {
      return [];
    }
  },

  async saveScheduleHistory(records: ScheduleHistoryRecord[]): Promise<void> {
    await safeSetItem(scheduleHistoryKey, JSON.stringify(keepRecent7DaysScheduleHistory(records)));
  },
};
