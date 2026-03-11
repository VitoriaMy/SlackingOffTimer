import { useMemo } from "react";
import { useDaySwitchRecords } from "./useDaySwitchRecords";
import { useEffectiveScheduleByDate } from "./useEffectiveScheduleByDate";
import type { DateInput } from "./useDaySwitchRecords";
import {
  computeDurationMsByRecords,
  formatDurationHours,
  getDayRangeByKey,
  getPlannedWorkMs,
  toRatio,
} from "./slackingStatsUtils";

export function useSlackingStatsByDate(dateInput: DateInput) {
  const { dayKey, daySwitchRecords } = useDaySwitchRecords(dateInput);
  const { effectiveScheduleForDay } = useEffectiveScheduleByDate(dateInput);

  const durationMs = useMemo(() => {
    const range = getDayRangeByKey(dayKey);
    if (!range || !effectiveScheduleForDay) {
      return 0;
    }

    return computeDurationMsByRecords(daySwitchRecords, range, Date.now(), effectiveScheduleForDay.schedule);
  }, [dayKey, daySwitchRecords, effectiveScheduleForDay]);

  const plannedWorkMs = useMemo(() => {
    if (!effectiveScheduleForDay) {
      return 0;
    }

    return getPlannedWorkMs(effectiveScheduleForDay.schedule);
  }, [effectiveScheduleForDay]);

  const ratio = useMemo(() => toRatio(durationMs, plannedWorkMs), [durationMs, plannedWorkMs]);

  return {
    dayKey,
    durationMs,
    durationText: formatDurationHours(durationMs),
    ratio,
  };
}
