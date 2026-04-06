import { ReactNode, useEffect } from "react";
import { Platform } from "react-native";
import { useSlackingStatusRecorder } from "@/hooks/useSlackingStatusRecorder";
import {
  isIgnoringBatteryOptimizations,
  requestIgnoreBatteryOptimizations,
  startBackgroundUsageMonitoring,
} from "@/native/backgroundUsage";

export function RootLayoutContent({ children }: { children: ReactNode }) {
  useSlackingStatusRecorder();

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const ensureAndroidBackgroundMonitoring = async () => {
      try {
        await startBackgroundUsageMonitoring();

        const ignored = await isIgnoringBatteryOptimizations();
        if (!ignored) {
          await requestIgnoreBatteryOptimizations();
        }
      } catch (error) {
        console.error("Failed to ensure Android background monitoring:", error);
      }
    };

    ensureAndroidBackgroundMonitoring();
  }, []);

  return <>{children}</>;
}