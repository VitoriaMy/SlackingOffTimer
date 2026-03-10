import { useMemo } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import {
  buildSchedulePeriods,
  computeDurationMsByRecords,
  findEffectiveScheduleForRange,
  formatDayKey,
  formatDurationHours,
  getDateByOffset,
  getDayRangeByKey,
  getPlannedWorkMs,
  toRatio,
  type EffectiveScheduleItem,
} from "./slackingStatsUtils";

type DailySlackingStats = {
  day: string;
  time: string;
  ratio: number;
  durationMs: number;
  dayKey: string;
};


export function useRecent7DaysSlackingStats() {
  const { schedule, scheduleHistory, slackingRecords } = useSettingsStore();

  const schedulePeriods = useMemo<EffectiveScheduleItem[]>(() => {
    return buildSchedulePeriods(schedule, scheduleHistory);
  }, [schedule, scheduleHistory]);

  const d7 = useMemo<DailySlackingStats[]>(() => {
    return [-6, -5, -4, -3, -2, -1, 0].map((offset) => {
      const date = getDateByOffset(offset);
      const dayKey = formatDayKey(date);
      const range = getDayRangeByKey(dayKey);

      const records = slackingRecords
        .filter((record) => formatDayKey(new Date(record.timestamp)) === dayKey);

      const durationMs = range ? computeDurationMsByRecords(records, range) : 0;
      const effectiveScheduleForDay = range ? findEffectiveScheduleForRange(schedulePeriods, range) : null;
      const plannedWorkMs = effectiveScheduleForDay ? getPlannedWorkMs(effectiveScheduleForDay.schedule) : 0;
      const ratio = toRatio(durationMs, plannedWorkMs);

      return {
        day: String(date.getDate()),
        time: formatDurationHours(durationMs),
        ratio,
        durationMs,
        dayKey,
      };
    });
  }, [schedulePeriods, slackingRecords]);

  const totalDurationMs = useMemo(() => d7.reduce((sum, item) => sum + item.durationMs, 0), [d7]);
  const averageDurationMs = useMemo(() => (d7.length > 0 ? totalDurationMs / d7.length : 0), [d7, totalDurationMs]);

  return {
    d7,
    totalDurationMs,
    averageDurationMs,
    totalDurationText: formatDurationHours(totalDurationMs),
    averageDurationText: formatDurationHours(averageDurationMs),
  };
}
