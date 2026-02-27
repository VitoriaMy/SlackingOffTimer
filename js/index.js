import {
  bindRestToggle,
  minutesFromTimeString,
  fillScheduleToForm,
  formatMinutes,
  getDateKey,
  inWorkWindow,
  isWorkDay,
  readScheduleFromForm,
  renderWeekdayCheckboxes,
  validateSchedule,
} from "./schedule.js";
import { addSessionRange, readTodayStat } from "./stats.js";
import { loadConfig, loadNoticeState, saveConfig, saveNoticeState } from "./storage.js";

const onboardingSection = document.querySelector("#onboarding");
const dashboardSection = document.querySelector("#dashboard");
const scheduleForm = document.querySelector("#schedule-form");
const workdayGroup = document.querySelector("#workday-group");
const formError = document.querySelector("#form-error");
const fishMinutesNode = document.querySelector("#fish-minutes");
const fishRatioNode = document.querySelector("#fish-ratio");
const statusNode = document.querySelector("#status");

let config = loadConfig();
let sessionStartMs = null;
let sessionStartDayKey = "";
let tickerId = null;

function showOnboarding() {
  onboardingSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  renderWeekdayCheckboxes(workdayGroup, config.schedule.workDays);
  fillScheduleToForm(scheduleForm, config.schedule);
  bindRestToggle(scheduleForm);
}

function showDashboard() {
  onboardingSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  renderDashboard();
  bootSessionWatchers();
  maybeSendDailySummary();
}

function setError(message) {
  if (!message) {
    formError.textContent = "";
    formError.classList.add("hidden");
    return;
  }
  formError.textContent = message;
  formError.classList.remove("hidden");
}

function renderDashboard() {
  const today = new Date();
  const todayStat = readTodayStat(config.schedule, today);
  fishMinutesNode.textContent = formatMinutes(todayStat.fishMinutes);
  const effective = todayStat.effectiveWorkMinutes || 0;
  const ratio = effective > 0 ? ((todayStat.fishMinutes / effective) * 100).toFixed(1) : "0.0";
  fishRatioNode.textContent = `${ratio}%`;

  if (!isWorkDay(config.schedule, today)) {
    statusNode.textContent = "非工作时段";
    return;
  }
  if (!inWorkWindow(config.schedule, today)) {
    statusNode.textContent = "非工作时段";
    return;
  }
  statusNode.textContent = sessionStartMs ? "计时中" : "待机";
}

function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

function summaryTextForToday(date = new Date()) {
  const todayStat = readTodayStat(config.schedule, date);
  const effective = todayStat.effectiveWorkMinutes || 0;
  const ratio = effective > 0 ? ((todayStat.fishMinutes / effective) * 100).toFixed(1) : "0.0";
  return `摸鱼时长${formatMinutes(todayStat.fishMinutes)}，摸鱼占比${ratio}%`;
}

function maybeSendDailySummary() {
  if (!config.dailySummaryEnabled) return;
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  const now = new Date();
  if (!isWorkDay(config.schedule, now)) return;
  const endMinute = minutesFromTimeString(config.schedule.endTime);
  if (Number.isNaN(endMinute)) return;
  const nowMinute = now.getHours() * 60 + now.getMinutes();
  if (nowMinute < endMinute) return;

  const todayKey = getDateKey(now);
  const noticeState = loadNoticeState();
  if (noticeState.lastSummaryDate === todayKey) return;

  const notification = new Notification("推送：摸鱼小计", {
    body: summaryTextForToday(now),
  });
  notification.onclick = () => window.focus();
  saveNoticeState({ lastSummaryDate: todayKey });
}

function canTrackNow() {
  return document.visibilityState === "visible" && document.hasFocus() && inWorkWindow(config.schedule, new Date());
}

function startSessionIfNeeded() {
  if (sessionStartMs || !canTrackNow()) return;
  sessionStartMs = Date.now();
  sessionStartDayKey = getDateKey(new Date(sessionStartMs));
}

function stopSessionIfNeeded() {
  if (!sessionStartMs) return;
  addSessionRange(config.schedule, sessionStartMs, Date.now());
  sessionStartMs = null;
  sessionStartDayKey = "";
}

function tick() {
  if (!config.configured) return;
  if (sessionStartMs && sessionStartDayKey !== getDateKey(new Date())) {
    stopSessionIfNeeded();
  }
  if (canTrackNow()) {
    startSessionIfNeeded();
  } else {
    stopSessionIfNeeded();
  }
  maybeSendDailySummary();
  renderDashboard();
}

function bootSessionWatchers() {
  if (tickerId) return;
  startSessionIfNeeded();
  tickerId = window.setInterval(tick, 15_000);
  window.addEventListener("focus", tick);
  window.addEventListener("blur", tick);
  document.addEventListener("visibilitychange", tick);
  window.addEventListener("pagehide", stopSessionIfNeeded);
  window.addEventListener("beforeunload", stopSessionIfNeeded);
}

scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const schedule = readScheduleFromForm(scheduleForm);
  const error = validateSchedule(schedule);
  if (error) {
    setError(error);
    return;
  }
  setError("");
  config = { configured: true, schedule, dailySummaryEnabled: config.dailySummaryEnabled };
  saveConfig(config);
  showDashboard();
});

if (config.configured) {
  showDashboard();
} else {
  showOnboarding();
}
