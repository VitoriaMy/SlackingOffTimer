import { useEffect, useMemo, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

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
  const { slackingRecords } = useSettingsStore();
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

    let total = 0;
    let activeStart: number | null = null;

    for (const record of records) {
      if (record.switchState === 1) {
        if (activeStart === null) {
          activeStart = record.timestamp;
        }
        continue;
      }

      if (activeStart !== null) {
        total += Math.max(0, record.timestamp - activeStart);
        activeStart = null;
      }
    }

    if (activeStart !== null) {
      total += Math.max(0, nowMs - activeStart);
    }

    return total;
  }, [nowMs, slackingRecords]);

  return {
    durationMs,
    durationText: formatDuration(durationMs),
  };
}
