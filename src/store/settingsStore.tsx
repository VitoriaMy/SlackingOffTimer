import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
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
  saveSlackingRecords
} from "../../lib/storage";
import { AppLanguage, ScheduleHistoryRecord, SlackingRecord, SlackSwitchState, WorkSchedule } from "../../lib/types";
import { normalizeSchedule } from "../schedule";

type SettingsStoreValue = {
  language: AppLanguage;
  languageDraft: AppLanguage;
  configured: boolean;
  schedule: WorkSchedule;
  slackingRecords: SlackingRecord[];
  scheduleHistory: ScheduleHistoryRecord[];
  updateLanguage: (next: AppLanguage) => void;
  setLanguageDraft: (next: AppLanguage) => void;
  updateSchedule: (next: WorkSchedule, shouldMarkConfigured?: boolean) => void;
  updateConfigured: (next: boolean) => void;
  addSlackingRecord: (switchState: SlackSwitchState) => void;
  reloadSlackingRecords: () => void;
  reloadScheduleHistory: () => void;
};

const SettingsStoreContext = createContext<SettingsStoreValue | null>(null);

export function SettingsStoreProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguage());
  const [languageDraft, setLanguageDraft] = useState<AppLanguage>(() => loadLanguage());
  const [configured, setConfigured] = useState<boolean>(() => loadConfigured());
  const [schedule, setSchedule] = useState<WorkSchedule>(() => normalizeSchedule(loadSchedule()));
  const [slackingRecords, setSlackingRecords] = useState<SlackingRecord[]>(() => loadSlackingRecords());
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleHistoryRecord[]>(() => loadScheduleHistory());

  const updateLanguage = useCallback((next: AppLanguage) => {
    setLanguage(next);
    setLanguageDraft(next);
    saveLanguage(next);
  }, []);

  const updateConfigured = useCallback((next: boolean) => {
    setConfigured(next);
    saveConfigured(next);
  }, []);

  const updateSchedule = useCallback((next: WorkSchedule, shouldMarkConfigured = true) => {
    const normalized = normalizeSchedule(next);
    setSchedule(normalized);
    saveSchedule(normalized);

    setScheduleHistory((current) => {
      const nextHistory = keepRecent7DaysScheduleHistory([
        ...current,
        {
          savedAt: Date.now(),
          schedule: normalized,
        },
      ]);
      saveScheduleHistory(nextHistory);
      return nextHistory;
    });

    if (shouldMarkConfigured) {
      setConfigured(true);
      saveConfigured(true);
    }
  }, []);

  const addSlackingRecord = useCallback((switchState: SlackSwitchState) => {
    setSlackingRecords((current) => {
      const next = keepRecent7DaysRecords([...current, { timestamp: Date.now(), switchState }]);
      saveSlackingRecords(next);
      return next;
    });
  }, []);

  const reloadSlackingRecords = useCallback(() => {
    const records = loadSlackingRecords();
    setSlackingRecords(records);
    saveSlackingRecords(records);
  }, []);

  const reloadScheduleHistory = useCallback(() => {
    const history = loadScheduleHistory();
    setScheduleHistory(history);
    saveScheduleHistory(history);
  }, []);

  const value = useMemo(
    () => ({
      language,
      languageDraft,
      configured,
      schedule,
      slackingRecords,
      scheduleHistory,
      updateLanguage,
      setLanguageDraft,
      updateSchedule,
      updateConfigured,
      addSlackingRecord,
      reloadSlackingRecords,
      reloadScheduleHistory
    }),
    [
      addSlackingRecord,
      configured,
      language,
      languageDraft,
      reloadScheduleHistory,
      reloadSlackingRecords,
      schedule,
      scheduleHistory,
      updateConfigured,
      updateLanguage,
      updateSchedule,
      slackingRecords,
    ]
  );

  return <SettingsStoreContext.Provider value={value}>{children}</SettingsStoreContext.Provider>;
}

export function useSettingsStore() {
  const context = useContext(SettingsStoreContext);
  if (!context) {
    throw new Error("useSettingsStore must be used within SettingsStoreProvider");
  }
  return context;
}
