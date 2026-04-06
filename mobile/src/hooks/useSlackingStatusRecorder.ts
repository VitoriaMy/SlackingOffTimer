import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store";
import { getWorkSegmentId } from "@/schedule";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { Gyroscope } from "expo-sensors";
import {
  startBackgroundUsageMonitoring,
  consumeBackgroundUsageEvents,
} from "@/native/backgroundUsage";
import type { SlackSwitchState } from "_/types";

const RECORD_INTERVAL_MS = 2 * 1000; // 每隔2秒记录一次
const GYROSCOPE_DETECT_INTERVAL_MS = 500;
const GYROSCOPE_ACTIVITY_THRESHOLD = 0.12;
const SCREEN_USAGE_TIMEOUT_MS = 5 * 1000; // 5秒内没有活动认为屏幕未使用

interface SlackingDetectionFactors {
  /** 陀螺仪检测：最近是否有设备运动 */
  isDeviceMoving: boolean;
  /** 解锁状态检测：设备是否处于活跃状态（解锁） */
  isDeviceUnlocked: boolean;
  /** 屏幕使用检测：屏幕最近是否被使用过 */
  isScreenUsing: boolean;
}

/**
 * 摸鱼状态记录器
 * 每隔2秒检测一次设备状态，任意一项检测命中即判定为摸鱼
 * 
 * 检测因素：
 * 1. gyroscope - 检测设备是否在运动
 * 2. deviceStatus - 通过AppState检测设备是否在前台（解锁）
 * 3. screenUsage - 检测屏幕最近是否被使用
 */
export function useSlackingStatusRecorder() {
  const { addSlackingRecord, appendSlackingRecords, isLoading, schedule } = useSettingsStore();

  const appStateRef = useRef<AppStateStatus>(AppState.currentState ?? "active");
  const lastGyroActivityRef = useRef<number>(Date.now());
  const lastScreenActivityRef = useRef<number>(Date.now());
  const useNativeBackgroundListener = Platform.OS === "android";

  // 初始化背景监听（Android）
  useEffect(() => {
    if (!useNativeBackgroundListener) {
      return;
    }

    startBackgroundUsageMonitoring().catch(() => {
      // Android-only native fallback; no-op if native module is unavailable
    });
  }, [useNativeBackgroundListener]);

  // 监听App状态变化
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
      if (nextState === "active") {
        lastScreenActivityRef.current = Date.now();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 监听陀螺仪变化
  useEffect(() => {
    Gyroscope.setUpdateInterval(GYROSCOPE_DETECT_INTERVAL_MS);
    const subscription = Gyroscope.addListener(({ x, y, z }) => {
      const movement = Math.abs(x) + Math.abs(y) + Math.abs(z);
      if (movement >= GYROSCOPE_ACTIVITY_THRESHOLD) {
        lastGyroActivityRef.current = Date.now();
        lastScreenActivityRef.current = Date.now();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 检测当前摸鱼状态因素
  const detectSlackingFactors = (): SlackingDetectionFactors => {
    const now = Date.now();
    
    // 1. 陀螺仪检测：最近5秒内有运动则认为在运动
    const isDeviceMoving = now - lastGyroActivityRef.current <= 5 * 1000;
    
    // 2. 解锁状态检测：AppState为active表示解锁
    const isDeviceUnlocked = appStateRef.current === "active";
    
    // 3. 屏幕使用检测：最近5秒内有APP活动或陀螺仪活动
    const isScreenUsing = now - lastScreenActivityRef.current <= SCREEN_USAGE_TIMEOUT_MS;
    
    return {
      isDeviceMoving,
      isDeviceUnlocked,
      isScreenUsing,
    };
  };

  // 判断是否处于摸鱼状态
  // 摸鱼状态定义：在工作时间内，三个检测因素任意一项满足即为摸鱼
  const isSlacking = (factors: SlackingDetectionFactors): boolean => {
    return factors.isDeviceMoving || factors.isDeviceUnlocked || factors.isScreenUsing;
  };

  // 定时检测并记录摸鱼状态
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const recordStatus = async () => {
      // 检查当前是否在工作时间段
      const workSegmentId = getWorkSegmentId(new Date(), schedule);
      if (!workSegmentId) {
        // 不在工作时间，无需记录
        return;
      }

      if (appStateRef.current === "active") {
        lastScreenActivityRef.current = Date.now();
      }

      const factors = detectSlackingFactors();
      const isCurrentlySlacking = isSlacking(factors);
      const status: SlackSwitchState = isCurrentlySlacking ? 1 : 0;

      try {
        await addSlackingRecord(status);
      } catch (error) {
        console.error("Failed to record slacking status:", error);
      }
    };

    // 立即执行一次
    recordStatus();
    
    // 之后每隔2秒执行一次
    const timer = setInterval(recordStatus, RECORD_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [addSlackingRecord, isLoading, schedule]);

  // 如果是Android，定时消费后台事件
  useEffect(() => {
    if (!useNativeBackgroundListener) {
      return;
    }

    const syncNativeEvents = async () => {
      try {
        const events = await consumeBackgroundUsageEvents();
        if (events.length > 0) {
          await appendSlackingRecords(events);
        }
      } catch (error) {
        console.error("Failed to sync native background events:", error);
      }
    };

    syncNativeEvents();
    const timer = setInterval(syncNativeEvents, 200);

    return () => {
      clearInterval(timer);
    };
  }, [appendSlackingRecords, useNativeBackgroundListener]);
}
