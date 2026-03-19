import { NativeModules } from "react-native";

export type BackgroundUsageEvent = {
  timestamp: number;
  switchState: 0 | 1;
};

type BackgroundUsageNativeModule = {
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  consumeEvents: () => Promise<BackgroundUsageEvent[]>;
};

const nativeModule = NativeModules.BackgroundUsageModule as BackgroundUsageNativeModule | undefined;

export async function startBackgroundUsageMonitoring(): Promise<void> {
  if (!nativeModule?.startMonitoring) {
    return;
  }

  await nativeModule.startMonitoring();
}

export async function stopBackgroundUsageMonitoring(): Promise<void> {
  if (!nativeModule?.stopMonitoring) {
    return;
  }

  await nativeModule.stopMonitoring();
}

export async function consumeBackgroundUsageEvents(): Promise<BackgroundUsageEvent[]> {
  if (!nativeModule?.consumeEvents) {
    return [];
  }

  const events = await nativeModule.consumeEvents();
  if (!Array.isArray(events)) {
    return [];
  }

  return events.filter(
    (event): event is BackgroundUsageEvent =>
      Boolean(event) &&
      typeof event.timestamp === "number" &&
      Number.isFinite(event.timestamp) &&
      (event.switchState === 0 || event.switchState === 1),
  );
}
