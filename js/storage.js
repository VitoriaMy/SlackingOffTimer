const CONFIG_KEY = "sot_app_config";
const STATS_KEY = "sot_daily_stats";
const NOTICE_KEY = "sot_notice_state";

export const DEFAULT_SCHEDULE = {
  workDays: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "18:00",
  restStart: "",
  restEnd: "",
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) {
      return { configured: false, schedule: DEFAULT_SCHEDULE, dailySummaryEnabled: false };
    }
    const parsed = JSON.parse(raw);
    return {
      configured: Boolean(parsed?.configured),
      schedule: parsed?.schedule || DEFAULT_SCHEDULE,
      dailySummaryEnabled: Boolean(parsed?.dailySummaryEnabled),
    };
  } catch (_error) {
    return { configured: false, schedule: DEFAULT_SCHEDULE, dailySummaryEnabled: false };
  }
}

export function saveConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_error) {
    return {};
  }
}

export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadNoticeState() {
  try {
    const raw = localStorage.getItem(NOTICE_KEY);
    if (!raw) return { lastSummaryDate: "" };
    const parsed = JSON.parse(raw);
    return {
      lastSummaryDate: String(parsed?.lastSummaryDate || ""),
    };
  } catch (_error) {
    return { lastSummaryDate: "" };
  }
}

export function saveNoticeState(state) {
  localStorage.setItem(NOTICE_KEY, JSON.stringify(state));
}

export function safeResetConfig() {
  localStorage.removeItem(CONFIG_KEY);
}
