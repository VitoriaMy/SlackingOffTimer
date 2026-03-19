export type BackgroundUsageEvent = {
  timestamp: number;
  switchState: 0 | 1;
};

export async function startBackgroundUsageMonitoring(): Promise<void> {
  return;
}

export async function stopBackgroundUsageMonitoring(): Promise<void> {
  return;
}

export async function consumeBackgroundUsageEvents(): Promise<BackgroundUsageEvent[]> {
  return [];
}
