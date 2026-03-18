import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettingsStore } from "@/store";
import { getWorkSegmentId } from "@/schedule";
import type { SlackSwitchState } from "_/types";

const SWITCH_STATE_TICK_MS = 30 * 1000;

export function useSlackRecord() {
  const { addSlackingRecord, reloadSlackingRecords, slackingRecords, schedule } = useSettingsStore();
  const initializedRef = useRef(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    reloadSlackingRecords();
  }, [reloadSlackingRecords]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, SWITCH_STATE_TICK_MS);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const currentSegmentId = useMemo(() => getWorkSegmentId(new Date(nowMs), schedule), [nowMs, schedule]);

  const currentSwitchState = useMemo<SlackSwitchState>(() => {
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
  }, [currentSegmentId, schedule, slackingRecords]);

  const recordSlackSwitch = useCallback(async () => {
    if (!currentSegmentId && currentSwitchState === 0) {
      return false;
    }

    const nextSwitchState: SlackSwitchState = currentSwitchState === 1 ? 0 : 1;
    await addSlackingRecord(nextSwitchState);
    return true;
  }, [addSlackingRecord, currentSegmentId, currentSwitchState]);

  return {
    recordSlackSwitch,
    currentSwitchState,
  };
}