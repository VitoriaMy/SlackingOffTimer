import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
      const newHistory = [...scheduleHistory, newHistoryRecord];
      const keptHistory = keepRecent7DaysScheduleHistory(newHistory);
      setScheduleHistory(keptHistory);
      await saveScheduleHistory(keptHistory);
    },
    [scheduleHistory],
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
      const newRecords = [...slackingRecords, newRecord];
      const keptRecords = keepRecent7DaysRecords(newRecords);
      setSlackingRecords(keptRecords);
      await saveSlackingRecords(keptRecords);
    },
    [slackingRecords],
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
