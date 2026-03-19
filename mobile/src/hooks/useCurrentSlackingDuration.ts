import { useEffect, useMemo, useState } from "react";
import { useSettingsStore } from "@/store";
import {
  buildSchedulePeriods,
  computeDurationMsByRecords,
  findEffectiveScheduleForRange,
  formatDayKey,
  getDayRangeByKey,
  getPlannedWorkMs,
  toRatio,
} from "./slackingStatsUtils";

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
  const { slackingRecords, schedule, scheduleHistory } = useSettingsStore();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, tickMs);

    return () => {
      clearInterval(timer);
    };
  }, [tickMs]);

  const { durationMs, ratio } = useMemo(() => {
    const dayStartMs = getStartOfTodayMs(nowMs);
    const records = slackingRecords.filter((record) => record.timestamp >= dayStartMs && record.timestamp <= nowMs);
    const schedulePeriods = buildSchedulePeriods(schedule, scheduleHistory);

    const dayKey = formatDayKey(new Date(nowMs));
    const range = getDayRangeByKey(dayKey);
    if (!range) {
      return {
        durationMs: 0,
        ratio: 0,
      };
    }

    const effectiveSchedule = findEffectiveScheduleForRange(schedulePeriods, range)?.schedule ?? schedule;
    const durationMs = computeDurationMsByRecords(records, range, nowMs, effectiveSchedule);
    const ratio = toRatio(durationMs, getPlannedWorkMs(effectiveSchedule));

    return {
      durationMs,
      ratio,
    };
  }, [nowMs, schedule, scheduleHistory, slackingRecords]);

  return {
    durationMs,
    durationText: formatDuration(durationMs),
    ratio,
  };
}