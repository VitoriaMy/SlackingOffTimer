import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  keepRecent7DaysScheduleHistory,
  keepRecent7DaysRecords,
  loadConfigured,
  loadSchedule,
  loadScheduleHistory,
  loadSlackingRecords,
  saveConfigured,
  saveSchedule,
  saveScheduleHistory,
  saveSlackingRecords,
} from "./storage";
import { AppLanguage, ScheduleHistoryRecord, SlackingRecord, SlackSwitchState, WorkSchedule, defaultSchedule } from "_/types";
import { normalizeSchedule } from "../schedule";

type SettingsStoreValue = {
  language: AppLanguage;
  configured: boolean;
  schedule: WorkSchedule;
  slackingRecords: SlackingRecord[];
  scheduleHistory: ScheduleHistoryRecord[];
  isLoading: boolean;
  updateSchedule: (next: WorkSchedule, shouldMarkConfigured?: boolean) => Promise<void>;
  updateConfigured: (next: boolean) => Promise<void>;
  addSlackingRecord: (switchState: SlackSwitchState) => Promise<void>;
  appendSlackingRecords: (records: SlackingRecord[]) => Promise<void>;
  reloadSlackingRecords: () => Promise<void>;
  reloadScheduleHistory: () => Promise<void>;
};

const SettingsStoreContext = createContext<SettingsStoreValue | null>(null);

function resolveSystemLanguage(): AppLanguage {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || "";
  return locale.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function SettingsStoreProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<AppLanguage>(() => resolveSystemLanguage());
  const [configured, setConfigured] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<WorkSchedule>(() => normalizeSchedule(defaultSchedule));
  const [slackingRecords, setSlackingRecords] = useState<SlackingRecord[]>([]);
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleHistoryRecord[]>([]);
  const slackingRecordsRef = useRef<SlackingRecord[]>([]);
  const scheduleHistoryRef = useRef<ScheduleHistoryRecord[]>([]);

  useEffect(() => {
    slackingRecordsRef.current = slackingRecords;
  }, [slackingRecords]);

  useEffect(() => {
    scheduleHistoryRef.current = scheduleHistory;
  }, [scheduleHistory]);

  // Initialize store from AsyncStorage
  useEffect(() => {
    const initStore = async () => {
      try {
        const [loadedConfigured, loadedSchedule, loadedRecords, loadedHistory] =
          await Promise.all([
            loadConfigured(),
            loadSchedule(),
            loadSlackingRecords(),
            loadScheduleHistory(),
          ]);

        setLanguage(resolveSystemLanguage());
        setConfigured(loadedConfigured);
        setSchedule(normalizeSchedule(loadedSchedule));
        setSlackingRecords(keepRecent7DaysRecords(loadedRecords));
        setScheduleHistory(keepRecent7DaysScheduleHistory(loadedHistory));
      } catch (error) {
        console.error("Failed to initialize store:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initStore();
  }, []);

  const updateSchedule = useCallback(
    async (next: WorkSchedule, shouldMarkConfigured = false) => {
      const normalized = normalizeSchedule(next);
      setSchedule(normalized);
      await saveSchedule(normalized);

      if (shouldMarkConfigured) {
        setConfigured(true);
        await saveConfigured(true);
      }

      // Add to schedule history
      const newHistoryRecord: ScheduleHistoryRecord = {
        savedAt: Date.now(),
        schedule: normalized,
      };
      const newHistory = [...scheduleHistoryRef.current, newHistoryRecord];
      const keptHistory = keepRecent7DaysScheduleHistory(newHistory);
      scheduleHistoryRef.current = keptHistory;
      setScheduleHistory(keptHistory);
      await saveScheduleHistory(keptHistory);
    },
    [],
  );

  const updateConfigured = useCallback(async (next: boolean) => {
    setConfigured(next);
    await saveConfigured(next);
  }, []);

  const addSlackingRecord = useCallback(
    async (switchState: SlackSwitchState) => {
      const newRecord: SlackingRecord = {
        timestamp: Date.now(),
        switchState,
      };
      const newRecords = [...slackingRecordsRef.current, newRecord];
      const keptRecords = keepRecent7DaysRecords(newRecords);
      slackingRecordsRef.current = keptRecords;
      setSlackingRecords(keptRecords);
      await saveSlackingRecords(keptRecords);
    },
    [],
  );

  const appendSlackingRecords = useCallback(
    async (records: SlackingRecord[]) => {
      if (records.length === 0) {
        return;
      }

      const valid = records.filter(
        (record) =>
          Number.isFinite(record.timestamp) &&
          (record.switchState === 0 || record.switchState === 1),
      );

      if (valid.length === 0) {
        return;
      }

      const merged = keepRecent7DaysRecords([...slackingRecordsRef.current, ...valid]);
      slackingRecordsRef.current = merged;
      setSlackingRecords(merged);
      await saveSlackingRecords(merged);
    },
    [],
  );

  const reloadSlackingRecords = useCallback(async () => {
    const records = await loadSlackingRecords();
    setSlackingRecords(records);
  }, []);

  const reloadScheduleHistory = useCallback(async () => {
    const history = await loadScheduleHistory();
    setScheduleHistory(history);
  }, []);

  const value = useMemo<SettingsStoreValue>(
    () => ({
      language,
      configured,
      schedule,
      slackingRecords,
      scheduleHistory,
      isLoading,
      updateSchedule,
      updateConfigured,
      addSlackingRecord,
      appendSlackingRecords,
      reloadSlackingRecords,
      reloadScheduleHistory,
    }),
    [
      language,
      configured,
      schedule,
      slackingRecords,
      scheduleHistory,
      isLoading,
      updateSchedule,
      updateConfigured,
      addSlackingRecord,
      appendSlackingRecords,
      reloadSlackingRecords,
      reloadScheduleHistory,
    ],
  );

  return (
    <SettingsStoreContext.Provider value={value}>
      {children}
    </SettingsStoreContext.Provider>
  );
}

export function useSettingsStore(): SettingsStoreValue {
  const context = useContext(SettingsStoreContext);
  if (!context) {
    throw new Error("useSettingsStore must be used within SettingsStoreProvider");
  }
  return context;
}
