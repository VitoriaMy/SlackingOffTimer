import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { normalizeSchedule } from "@/core/schedule";
import {
  AppLanguage,
  defaultSchedule,
  ScheduleHistoryRecord,
  SlackingRecord,
  SlackSwitchState,
  WorkSchedule,
} from "@/core/types";
import {
  keepRecent7DaysRecords,
  keepRecent7DaysScheduleHistory,
  nativeStorage,
} from "@/storage/storage.native";

type SettingsStoreValue = {
  loading: boolean;
  language: AppLanguage;
  configured: boolean;
  schedule: WorkSchedule;
  slackingRecords: SlackingRecord[];
  scheduleHistory: ScheduleHistoryRecord[];
  updateLanguage: (next: AppLanguage) => Promise<void>;
  updateSchedule: (next: WorkSchedule, shouldMarkConfigured?: boolean) => Promise<void>;
  updateConfigured: (next: boolean) => Promise<void>;
  addSlackingRecord: (switchState: SlackSwitchState) => Promise<void>;
  reloadSlackingRecords: () => Promise<void>;
  reloadScheduleHistory: () => Promise<void>;
};

const SettingsStoreContext = createContext<SettingsStoreValue | null>(null);

export function SettingsStoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<AppLanguage>("zh");
  const [configured, setConfigured] = useState(false);
  const [schedule, setSchedule] = useState<WorkSchedule>(defaultSchedule);
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

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const [nextLanguage, nextConfigured, nextSchedule, nextRecords, nextHistory] = await Promise.all([
        nativeStorage.loadLanguage(),
        nativeStorage.loadConfigured(),
        nativeStorage.loadSchedule(),
        nativeStorage.loadSlackingRecords(),
        nativeStorage.loadScheduleHistory(),
      ]);

      if (!mounted) {
        return;
      }

      setLanguage(nextLanguage);
      setConfigured(nextConfigured);
      setSchedule(normalizeSchedule(nextSchedule));
      setSlackingRecords(nextRecords);
      setScheduleHistory(nextHistory);
      setLoading(false);
    };

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  const updateLanguage = useCallback(async (next: AppLanguage) => {
    setLanguage(next);
    await nativeStorage.saveLanguage(next);
  }, []);

  const updateConfigured = useCallback(async (next: boolean) => {
    setConfigured(next);
    await nativeStorage.saveConfigured(next);
  }, []);

  const updateSchedule = useCallback(async (next: WorkSchedule, shouldMarkConfigured = true) => {
    const normalized = normalizeSchedule(next);
    setSchedule(normalized);
    await nativeStorage.saveSchedule(normalized);

    const nextHistory = keepRecent7DaysScheduleHistory([
      ...scheduleHistoryRef.current,
      {
        savedAt: Date.now(),
        schedule: normalized,
      },
    ]);
    setScheduleHistory(nextHistory);
    await nativeStorage.saveScheduleHistory(nextHistory);

    if (shouldMarkConfigured) {
      setConfigured(true);
      await nativeStorage.saveConfigured(true);
    }
  }, []);

  const addSlackingRecord = useCallback(async (switchState: SlackSwitchState) => {
    const next = keepRecent7DaysRecords([
      ...slackingRecordsRef.current,
      { timestamp: Date.now(), switchState },
    ]);
    setSlackingRecords(next);
    await nativeStorage.saveSlackingRecords(next);
  }, []);

  const reloadSlackingRecords = useCallback(async () => {
    const records = await nativeStorage.loadSlackingRecords();
    setSlackingRecords(records);
    await nativeStorage.saveSlackingRecords(records);
  }, []);

  const reloadScheduleHistory = useCallback(async () => {
    const history = await nativeStorage.loadScheduleHistory();
    setScheduleHistory(history);
    await nativeStorage.saveScheduleHistory(history);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      language,
      configured,
      schedule,
      slackingRecords,
      scheduleHistory,
      updateLanguage,
      updateSchedule,
      updateConfigured,
      addSlackingRecord,
      reloadSlackingRecords,
      reloadScheduleHistory,
    }),
    [
      addSlackingRecord,
      configured,
      language,
      loading,
      reloadScheduleHistory,
      reloadSlackingRecords,
      schedule,
      scheduleHistory,
      slackingRecords,
      updateConfigured,
      updateLanguage,
      updateSchedule,
    ],
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
