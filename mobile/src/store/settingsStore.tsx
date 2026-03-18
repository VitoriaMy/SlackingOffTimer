import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  keepRecent7DaysScheduleHistory,
  keepRecent7DaysRecords,
  loadConfigured,
  loadLanguage,
  loadSchedule,
  loadScheduleHistory,
  loadSlackingRecords,
  saveConfigured,
  saveLanguage,
  saveSchedule,
  saveScheduleHistory,
  saveSlackingRecords,
} from "./storage";
import { AppLanguage, ScheduleHistoryRecord, SlackingRecord, SlackSwitchState, WorkSchedule, defaultSchedule } from "_/types";
import { normalizeSchedule } from "../schedule";

type SettingsStoreValue = {
  language: AppLanguage;
  languageDraft: AppLanguage;
  configured: boolean;
  schedule: WorkSchedule;
  slackingRecords: SlackingRecord[];
  scheduleHistory: ScheduleHistoryRecord[];
  isLoading: boolean;
  updateLanguage: (next: AppLanguage) => Promise<void>;
  setLanguageDraft: (next: AppLanguage) => void;
  updateSchedule: (next: WorkSchedule, shouldMarkConfigured?: boolean) => Promise<void>;
  updateConfigured: (next: boolean) => Promise<void>;
  addSlackingRecord: (switchState: SlackSwitchState) => Promise<void>;
  reloadSlackingRecords: () => Promise<void>;
  reloadScheduleHistory: () => Promise<void>;
};

const SettingsStoreContext = createContext<SettingsStoreValue | null>(null);

export function SettingsStoreProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<AppLanguage>("zh");
  const [languageDraft, setLanguageDraft] = useState<AppLanguage>("zh");
  const [configured, setConfigured] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<WorkSchedule>(() => normalizeSchedule(defaultSchedule));
  const [slackingRecords, setSlackingRecords] = useState<SlackingRecord[]>([]);
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleHistoryRecord[]>([]);

  // Initialize store from AsyncStorage
  useEffect(() => {
    const initStore = async () => {
      try {
        const [loadedLanguage, loadedConfigured, loadedSchedule, loadedRecords, loadedHistory] =
          await Promise.all([
            loadLanguage(),
            loadConfigured(),
            loadSchedule(),
            loadSlackingRecords(),
            loadScheduleHistory(),
          ]);

        setLanguage(loadedLanguage);
        setLanguageDraft(loadedLanguage);
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

  const updateLanguage = useCallback(async (next: AppLanguage) => {
    setLanguage(next);
    setLanguageDraft(next);
    await saveLanguage(next);
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
      languageDraft,
      configured,
      schedule,
      slackingRecords,
      scheduleHistory,
      isLoading,
      updateLanguage,
      setLanguageDraft,
      updateSchedule,
      updateConfigured,
      addSlackingRecord,
      reloadSlackingRecords,
      reloadScheduleHistory,
    }),
    [
      language,
      languageDraft,
      configured,
      schedule,
      slackingRecords,
      scheduleHistory,
      isLoading,
      updateLanguage,
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
