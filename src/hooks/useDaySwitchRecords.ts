import { useMemo } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import type { SlackingRecord } from "../../lib/types";

export type DateInput = string | Date;

function formatDayKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDayKey(dateInput: DateInput): string {
  if (dateInput instanceof Date) {
    return formatDayKey(dateInput);
  }
  return dateInput;
}

export function useDaySwitchRecords(dateInput: DateInput) {
  const { slackingRecords } = useSettingsStore();

  const dayKey = useMemo(() => normalizeDayKey(dateInput), [dateInput]);

  const daySwitchRecords = useMemo<SlackingRecord[]>(() => {
    return [...slackingRecords]
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter((record) => formatDayKey(new Date(record.timestamp)) === dayKey);
  }, [dayKey, slackingRecords]);

  return {
    dayKey,
    daySwitchRecords,
  };
}
