import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettingsStore } from "@/store";
import { getWorkSegmentId } from "@/schedule";
import { AppState, type AppStateStatus } from "react-native";
import { Gyroscope } from "expo-sensors";
import type { SlackSwitchState } from "_/types";

const SWITCH_STATE_TICK_MS = 5 * 1000;
const AUTO_SWITCH_TICK_MS = 5 * 1000;
const GYROSCOPE_UPDATE_MS = 1000;
const GYROSCOPE_ACTIVITY_THRESHOLD = 0.12;
const USER_ACTIVE_TIMEOUT_MS = 20 * 1000;

export function useSlackRecord() {
  const { addSlackingRecord, reloadSlackingRecords, slackingRecords, schedule } = useSettingsStore();
  const initializedRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState ?? "active");
  const lastActiveAtRef = useRef<number>(Date.now());
  const switchingRef = useRef(false);
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

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
      if (nextState === "active") {
        lastActiveAtRef.current = Date.now();
      }
      setNowMs(Date.now());
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    Gyroscope.setUpdateInterval(GYROSCOPE_UPDATE_MS);
    const subscription = Gyroscope.addListener(({ x, y, z }) => {
      const movement = Math.abs(x) + Math.abs(y) + Math.abs(z);
      if (movement >= GYROSCOPE_ACTIVITY_THRESHOLD) {
        lastActiveAtRef.current = Date.now();
      }
    });

    return () => {
      subscription.remove();
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

  useEffect(() => {
    const syncAutoSwitch = async () => {
      if (switchingRef.current) {
        return;
      }

      const appIsActive = appStateRef.current === "active";
      const recentlyActive = Date.now() - lastActiveAtRef.current <= USER_ACTIVE_TIMEOUT_MS;
      const shouldTrack = Boolean(currentSegmentId) && appIsActive && recentlyActive;
      const targetState: SlackSwitchState = shouldTrack ? 1 : 0;

      if (targetState === currentSwitchState) {
        return;
      }

      switchingRef.current = true;
      try {
        await addSlackingRecord(targetState);
      } finally {
        switchingRef.current = false;
      }
    };

    syncAutoSwitch();
    const timer = setInterval(syncAutoSwitch, AUTO_SWITCH_TICK_MS);

    return () => {
      clearInterval(timer);
    };
  }, [addSlackingRecord, currentSegmentId, currentSwitchState]);

  return {
    recordSlackSwitch,
    currentSwitchState,
  };
}