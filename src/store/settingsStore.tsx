import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import {
  keepRecent7DaysRecords,
  loadConfigured,
  loadLanguage,
  loadSchedule,
  loadSlackingRecords,
  saveConfigured,
  saveLanguage,
  saveSchedule,
  saveSlackingRecords
} from "../../lib/storage";
import { AppLanguage, SlackingRecord, SlackSwitchState, WorkSchedule } from "../../lib/types";
import { normalizeSchedule } from "../schedule";

type SettingsStoreValue = {
  language: AppLanguage;
  languageDraft: AppLanguage;
  configured: boolean;
  schedule: WorkSchedule;
  slackingRecords: SlackingRecord[];
  updateLanguage: (next: AppLanguage) => void;
  setLanguageDraft: (next: AppLanguage) => void;
  updateSchedule: (next: WorkSchedule, shouldMarkConfigured?: boolean) => void;
  updateConfigured: (next: boolean) => void;
  addSlackingRecord: (switchState: SlackSwitchState) => void;
  reloadSlackingRecords: () => void;
};

const SettingsStoreContext = createContext<SettingsStoreValue | null>(null);

export function SettingsStoreProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguage());
  const [languageDraft, setLanguageDraft] = useState<AppLanguage>(() => loadLanguage());
  const [configured, setConfigured] = useState<boolean>(() => loadConfigured());
  const [schedule, setSchedule] = useState<WorkSchedule>(() => normalizeSchedule(loadSchedule()));
  const [slackingRecords, setSlackingRecords] = useState<SlackingRecord[]>(() => loadSlackingRecords());

  const updateLanguage = (next: AppLanguage) => {
    setLanguage(next);
    setLanguageDraft(next);
    saveLanguage(next);
  };

  const updateConfigured = (next: boolean) => {
    setConfigured(next);
    saveConfigured(next);
  };

  const updateSchedule = (next: WorkSchedule, shouldMarkConfigured = true) => {
    const normalized = normalizeSchedule(next);
    setSchedule(normalized);
    saveSchedule(normalized);
    if (shouldMarkConfigured) {
      setConfigured(true);
      saveConfigured(true);
    }
  };

  const addSlackingRecord = (switchState: SlackSwitchState) => {
    setSlackingRecords((current) => {
      const next = keepRecent7DaysRecords([...current, { timestamp: Date.now(), switchState }]);
      saveSlackingRecords(next);
      return next;
    });
  };

  const reloadSlackingRecords = () => {
    const records = loadSlackingRecords();
    setSlackingRecords(records);
    saveSlackingRecords(records);
  };

  const value = useMemo(
    () => ({
      language,
      languageDraft,
      configured,
      schedule,
      slackingRecords,
      updateLanguage,
      setLanguageDraft,
      updateSchedule,
      updateConfigured,
      addSlackingRecord,
      reloadSlackingRecords
    }),
    [configured, language, languageDraft, schedule, slackingRecords]
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
