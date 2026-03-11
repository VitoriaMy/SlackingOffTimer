import { useEffect, useMemo, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { computeDurationMsByRecords, formatDayKey, getDayRangeByKey } from "./slackingStatsUtils";

const DEFAULT_TICK_MS = 1000;

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getStartOfTodayMs(nowMs: number): number {
  const now = new Date(nowMs);
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

export function useCurrentSlackingDuration(tickMs = DEFAULT_TICK_MS) {
  const { slackingRecords, schedule } = useSettingsStore();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, tickMs);

    return () => {
      window.clearInterval(timer);
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
    durationText: formatDuration(durationMs),
  };
}
