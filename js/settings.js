import {
  bindRestToggle,
  fillScheduleToForm,
  readScheduleFromForm,
  renderWeekdayCheckboxes,
  validateSchedule,
} from "./schedule.js";
import { loadConfig, saveConfig } from "./storage.js";

const form = document.querySelector("#settings-form");
const workdayGroup = document.querySelector("#workday-group");
const errorNode = document.querySelector("#form-error");
const pushStatusNode = document.querySelector("#push-status");
const pushToggleButton = document.querySelector("#push-toggle");

let config = loadConfig();
if (!config.configured) {
  window.location.replace("./index.html");
} else {
  renderWeekdayCheckboxes(workdayGroup, config.schedule.workDays);
  fillScheduleToForm(form, config.schedule);
  bindRestToggle(form);
  renderPushUI();
}

function setError(message) {
  if (!message) {
    errorNode.textContent = "";
    errorNode.classList.add("hidden");
    return;
  }
  errorNode.textContent = message;
  errorNode.classList.remove("hidden");
}

function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

function renderPushUI() {
  if (!notificationsSupported()) {
    pushStatusNode.textContent = "当前浏览器不支持通知";
    pushToggleButton.disabled = true;
    pushToggleButton.textContent = "无法开启";
    return;
  }

  const permission = Notification.permission;
  if (config.dailySummaryEnabled && permission === "granted") {
    pushStatusNode.textContent = "已开启，下班后推送摸鱼小计";
    pushToggleButton.disabled = false;
    pushToggleButton.textContent = "关闭推送";
    return;
  }
  if (permission === "denied") {
    pushStatusNode.textContent = "通知权限被拒绝，请在浏览器设置中允许";
    pushToggleButton.disabled = true;
    pushToggleButton.textContent = "权限已拒绝";
    return;
  }
  pushStatusNode.textContent = "未开启";
  pushToggleButton.disabled = false;
  pushToggleButton.textContent = "开启推送";
}

async function togglePush() {
  if (!notificationsSupported()) return;

  if (config.dailySummaryEnabled && Notification.permission === "granted") {
    config = { ...config, dailySummaryEnabled: false };
    saveConfig(config);
    renderPushUI();
    return;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      config = { ...config, dailySummaryEnabled: false };
      saveConfig(config);
      renderPushUI();
      return;
    }
  }

  if (Notification.permission === "granted") {
    config = { ...config, dailySummaryEnabled: true };
    saveConfig(config);
  }
  renderPushUI();
}

form.addEventListener("submit", (event) => {
  if (!config.configured) return;
  event.preventDefault();
  const schedule = readScheduleFromForm(form);
  const error = validateSchedule(schedule);
  if (error) {
    setError(error);
    return;
  }
  saveConfig({ configured: true, schedule, dailySummaryEnabled: config.dailySummaryEnabled });
  window.location.replace("./index.html");
});

pushToggleButton.addEventListener("click", () => {
  if (!config.configured) return;
  togglePush();
});
