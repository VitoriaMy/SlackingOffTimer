import { useMemo } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import type { DateInput } from "./useDaySwitchRecords";
import {
  buildSchedulePeriods,
  findEffectiveScheduleForRange,
  formatDayKey,
  getDayRangeByKey,
  type EffectiveScheduleItem,
} from "./slackingStatsUtils";

export type { EffectiveScheduleItem };

function normalizeDayKey(dateInput: DateInput): string {
  if (dateInput instanceof Date) {
    return formatDayKey(dateInput);
  }
  return dateInput;
}

export function useEffectiveScheduleByDate(dateInput: DateInput) {
  const { schedule, scheduleHistory } = useSettingsStore();

  const dayKey = useMemo(() => normalizeDayKey(dateInput), [dateInput]);

  const schedulePeriods = useMemo<EffectiveScheduleItem[]>(() => {
    return buildSchedulePeriods(schedule, scheduleHistory);
  }, [schedule, scheduleHistory]);

  const effectiveScheduleForDay = useMemo<EffectiveScheduleItem | null>(() => {
    const range = getDayRangeByKey(dayKey);
    if (!range) {
      return null;
    }

    return findEffectiveScheduleForRange(schedulePeriods, range);
  }, [dayKey, schedulePeriods]);

  return {
    dayKey,
    effectiveScheduleForDay,
  };
}
