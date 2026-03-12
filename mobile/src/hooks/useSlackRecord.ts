import { useCallback, useMemo } from "react";
import { SlackSwitchState } from "@/core/types";
import { useSettingsStore } from "@/store/settingsStore";

function toMinutes(hhmm: string): number {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

function getTodayBoundaryTimestamp(now: Date, hhmm: string): number {
  const minutes = toMinutes(hhmm);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  const point = new Date(now);
  point.setHours(hour, minute, 0, 0);
  return point.getTime();
}

export function useSlackRecord() {
  const { addSlackingRecord, slackingRecords, schedule } = useSettingsStore();

  const currentSwitchState = useMemo<SlackSwitchState>(() => {
    const lastRecord = slackingRecords[slackingRecords.length - 1];
    if (!lastRecord) {
      return 0;
    }

    const now = new Date();
    const nowMs = now.getTime();
    const workStartMs = getTodayBoundaryTimestamp(now, schedule.startTime);

    if (lastRecord.timestamp < workStartMs) {
      return 0;
    }

    if (schedule.lunchStart) {
      const lunchStartMs = getTodayBoundaryTimestamp(now, schedule.lunchStart);
      if (nowMs >= lunchStartMs && lastRecord.timestamp < lunchStartMs) {
        return 0;
      }
    }

    return lastRecord.switchState;
  }, [schedule.lunchStart, schedule.startTime, slackingRecords]);

  const recordSlackSwitch = useCallback(async () => {
    const nextSwitchState: SlackSwitchState = currentSwitchState === 1 ? 0 : 1;
    await addSlackingRecord(nextSwitchState);
  }, [addSlackingRecord, currentSwitchState]);

  return {
    recordSlackSwitch,
    currentSwitchState,
  };
}
