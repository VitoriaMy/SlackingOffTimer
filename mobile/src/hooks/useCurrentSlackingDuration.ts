import { useEffect, useMemo, useState } from "react";
import { AppLanguage } from "@/src/core/types";
import { computeDurationMsByRecords, formatDayKey, getDayRangeByKey } from "@/src/hooks/slackingStatsUtils";
import { useSettingsStore } from "@/src/store/settingsStore";

const DEFAULT_TICK_MS = 1000;

function formatDuration(durationMs: number, language: AppLanguage): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (language === "zh") {
    return `${String(hours).padStart(2, "0")}时${String(minutes).padStart(2, "0")}分${String(seconds).padStart(2, "0")}秒`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getStartOfTodayMs(nowMs: number): number {
  const now = new Date(nowMs);
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

export function useCurrentSlackingDuration(tickMs = DEFAULT_TICK_MS) {
  const { slackingRecords, language, schedule } = useSettingsStore();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, tickMs);

    return () => {
      clearInterval(timer);
    };
  }, [tickMs]);

  const durationMs = useMemo(() => {
    const dayStartMs = getStartOfTodayMs(nowMs);
    const records = slackingRecords.filter((record) => record.timestamp >= dayStartMs && record.timestamp <= nowMs);

    const dayKey = formatDayKey(new Date(nowMs));
    const range = getDayRangeByKey(dayKey);
    if (!range) {
      return 0;
    }

    return computeDurationMsByRecords(records, range, nowMs, schedule);
  }, [nowMs, schedule, slackingRecords]);

  return {
    durationMs,
    durationText: formatDuration(durationMs, language),
  };
}
