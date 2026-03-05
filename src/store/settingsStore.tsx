import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import {
  loadConfigured,
  loadLanguage,
  loadSchedule,
  saveConfigured,
  saveLanguage,
  saveSchedule
} from "../../lib/storage";
import { AppLanguage, WorkSchedule } from "../../lib/types";
import { normalizeSchedule } from "../schedule";

type SettingsStoreValue = {
  language: AppLanguage;
  languageDraft: AppLanguage;
  configured: boolean;
  schedule: WorkSchedule;
  updateLanguage: (next: AppLanguage) => void;
  setLanguageDraft: (next: AppLanguage) => void;
  updateSchedule: (next: WorkSchedule, shouldMarkConfigured?: boolean) => void;
  updateConfigured: (next: boolean) => void;
};

const SettingsStoreContext = createContext<SettingsStoreValue | null>(null);

export function SettingsStoreProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguage());
  const [languageDraft, setLanguageDraft] = useState<AppLanguage>(() => loadLanguage());
  const [configured, setConfigured] = useState<boolean>(() => loadConfigured());
  const [schedule, setSchedule] = useState<WorkSchedule>(() => normalizeSchedule(loadSchedule()));

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

  const value = useMemo(
    () => ({
      language,
      languageDraft,
      configured,
      schedule,
      updateLanguage,
      setLanguageDraft,
      updateSchedule,
      updateConfigured
    }),
    [configured, language, languageDraft, schedule]
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
