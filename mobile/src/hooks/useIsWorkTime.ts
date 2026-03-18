import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store";
import { isWorkWindow } from "_/time";

const DEFAULT_TICK_MS = 30 * 1000;

export function useIsWorkTime(tickMs = DEFAULT_TICK_MS) {
  const { schedule } = useSettingsStore();
  const [isWorkTime, setIsWorkTime] = useState<boolean>(() => isWorkWindow(new Date(), schedule));

  useEffect(() => {
    const update = () => {
      setIsWorkTime(isWorkWindow(new Date(), schedule));
    };

    update();
    const timer = setInterval(update, tickMs);

    return () => {
      clearInterval(timer);
    };
  }, [schedule, tickMs]);

  return isWorkTime;
}