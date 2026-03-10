import { useDaySwitchRecords } from "./useDaySwitchRecords";
import { useEffectiveScheduleByDate } from "./useEffectiveScheduleByDate";
import type { DateInput } from "./useDaySwitchRecords";

export function useDateStatusSnapshot(dateInput: DateInput) {
  const { dayKey, daySwitchRecords } = useDaySwitchRecords(dateInput);
  const { effectiveScheduleForDay } = useEffectiveScheduleByDate(dateInput);

  return {
    dayKey,
    daySwitchRecords,
    effectiveScheduleForDay,
  };
}
