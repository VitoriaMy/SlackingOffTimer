import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { getWorkSegmentId } from "@/schedule";
import type { SlackSwitchState } from "../../lib/types";

const SWITCH_STATE_TICK_MS = 30 * 1000;

/**
 * 用于记录 Slack 开关状态的 Hook。它会在组件首次挂载时从 localStorage 加载历史记录，并提供一个函数用于添加新的记录。
 * 通过使用 useSettingsStore 中的 addSlackingRecord 和 reloadSlackingRecords 方法来管理记录的状态和持久化。
 */

export function useSlackRecord() {
  const { addSlackingRecord, reloadSlackingRecords, slackingRecords, schedule } = useSettingsStore();
  const initializedRef = useRef(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    // Reload from localStorage when entering the page to prioritize persisted history.
    reloadSlackingRecords();
  }, [reloadSlackingRecords]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, SWITCH_STATE_TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const currentSwitchState = useMemo<SlackSwitchState>(() => {
    const currentSegmentId = getWorkSegmentId(new Date(nowMs), schedule);
    if (!currentSegmentId) {
      return 0;
    }

    for (let index = slackingRecords.length - 1; index >= 0; index -= 1) {
      const record = slackingRecords[index];
      const recordSegmentId = getWorkSegmentId(new Date(record.timestamp), schedule);
      if (recordSegmentId === currentSegmentId) {
        return record.switchState;
      }
    }

    return 0;
  }, [nowMs, schedule, slackingRecords]);

  const recordSlackSwitch = useCallback(() => {
    const nextSwitchState: SlackSwitchState = currentSwitchState === 1 ? 0 : 1;
    addSlackingRecord(nextSwitchState);
  }, [addSlackingRecord, currentSwitchState]);

  return {
    recordSlackSwitch,
    currentSwitchState,
  };
}
