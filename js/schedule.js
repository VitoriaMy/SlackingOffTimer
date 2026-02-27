const WEEKDAY_TEXT = ["日", "一", "二", "三", "四", "五", "六"];

export function minutesFromTimeString(value) {
  const [hours, minutes] = String(value || "").split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return NaN;
  return hours * 60 + minutes;
}

export function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes || 0));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}分钟`;
  if (!m) return `${h}小时`;
  return `${h}小时${m}分钟`;
}

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isWorkDay(schedule, date = new Date()) {
  const days = Array.isArray(schedule?.workDays) ? schedule.workDays : [];
  return days.includes(date.getDay());
}

export function inRestWindow(schedule, date = new Date()) {
  if (!schedule?.restStart || !schedule?.restEnd) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  const restStart = minutesFromTimeString(schedule.restStart);
  const restEnd = minutesFromTimeString(schedule.restEnd);
  if (Number.isNaN(restStart) || Number.isNaN(restEnd)) return false;
  return now >= restStart && now < restEnd;
}

export function inWorkWindow(schedule, date = new Date()) {
  if (!isWorkDay(schedule, date)) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  const start = minutesFromTimeString(schedule.startTime);
  const end = minutesFromTimeString(schedule.endTime);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  if (!(now >= start && now < end)) return false;
  if (inRestWindow(schedule, date)) return false;
  return true;
}

export function effectiveWorkMinutes(schedule) {
  const start = minutesFromTimeString(schedule.startTime);
  const end = minutesFromTimeString(schedule.endTime);
  if (Number.isNaN(start) || Number.isNaN(end) || start >= end) return 0;
  let minutes = end - start;
  const restStart = minutesFromTimeString(schedule.restStart);
  const restEnd = minutesFromTimeString(schedule.restEnd);
  if (!Number.isNaN(restStart) && !Number.isNaN(restEnd) && restStart < restEnd) {
    minutes -= Math.max(0, restEnd - restStart);
  }
  return Math.max(0, minutes);
}

export function validateSchedule(input) {
  const workDays = Array.isArray(input?.workDays)
    ? input.workDays
        .map(Number)
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    : [];
  if (!workDays.length) return "请至少选择一个工作日";
  const start = minutesFromTimeString(input?.startTime);
  const end = minutesFromTimeString(input?.endTime);
  if (Number.isNaN(start) || Number.isNaN(end)) return "请填写上下班时间";
  if (start >= end) return "上班时间必须早于下班时间";

  const hasRestStart = Boolean(input?.restStart);
  const hasRestEnd = Boolean(input?.restEnd);
  if (hasRestStart !== hasRestEnd) return "休息开始和结束需同时填写";
  if (hasRestStart && hasRestEnd) {
    const restStart = minutesFromTimeString(input.restStart);
    const restEnd = minutesFromTimeString(input.restEnd);
    if (Number.isNaN(restStart) || Number.isNaN(restEnd)) return "休息时间格式不正确";
    if (restStart >= restEnd) return "休息开始时间必须早于休息结束时间";
    if (restStart < start || restEnd > end) return "休息区间必须落在工作时间内";
  }
  return "";
}

export function renderWeekdayCheckboxes(container, selectedDays) {
  const selectedSet = new Set(Array.isArray(selectedDays) ? selectedDays.map(Number) : []);
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  container.innerHTML = "";
  for (const day of dayOrder) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "workDays";
    checkbox.value = String(day);
    checkbox.checked = selectedSet.has(day);
    label.append(checkbox, `周${WEEKDAY_TEXT[day]}`);
    container.append(label);
  }
}

export function readScheduleFromForm(form) {
  const formData = new FormData(form);
  const workDays = formData
    .getAll("workDays")
    .map(Number)
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  const enableRest = formData.get("enableRest") === "on";
  return {
    workDays,
    startTime: String(formData.get("startTime") || ""),
    endTime: String(formData.get("endTime") || ""),
    restStart: enableRest ? String(formData.get("restStart") || "") : "",
    restEnd: enableRest ? String(formData.get("restEnd") || "") : "",
  };
}

export function fillScheduleToForm(form, schedule) {
  form.elements.startTime.value = schedule.startTime || "";
  form.elements.endTime.value = schedule.endTime || "";
  form.elements.restStart.value = schedule.restStart || "";
  form.elements.restEnd.value = schedule.restEnd || "";
  if (form.elements.enableRest) {
    form.elements.enableRest.checked = Boolean(schedule.restStart && schedule.restEnd);
  }
}

export function bindRestToggle(form) {
  const toggle = form.elements.enableRest;
  const restStart = form.elements.restStart;
  const restEnd = form.elements.restEnd;
  if (!toggle || !restStart || !restEnd) return;

  const sync = () => {
    const enabled = Boolean(toggle.checked);
    restStart.disabled = !enabled;
    restEnd.disabled = !enabled;
    if (!enabled) {
      restStart.value = "";
      restEnd.value = "";
    }
  };

  toggle.addEventListener("change", sync);
  sync();
}
