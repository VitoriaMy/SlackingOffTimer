import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import type { SlackSwitchState } from "../../lib/types";

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

/**
 * 用于记录 Slack 开关状态的 Hook。它会在组件首次挂载时从 localStorage 加载历史记录，并提供一个函数用于添加新的记录。
 * 通过使用 useSettingsStore 中的 addSlackingRecord 和 reloadSlackingRecords 方法来管理记录的状态和持久化。
 */

export function useSlackRecord() {
  const { addSlackingRecord, reloadSlackingRecords, slackingRecords, schedule } = useSettingsStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    // Reload from localStorage when entering the page to prioritize persisted history.
    reloadSlackingRecords();
  }, [reloadSlackingRecords]);

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

  const recordSlackSwitch = useCallback(() => {
    const nextSwitchState: SlackSwitchState = currentSwitchState === 1 ? 0 : 1;
    addSlackingRecord(nextSwitchState);
  }, [addSlackingRecord, currentSwitchState]);

  return {
    recordSlackSwitch,
    currentSwitchState,
  };
}
