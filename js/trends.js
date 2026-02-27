import { formatMinutes } from "./schedule.js";
import { readRecentDays } from "./stats.js";
import { loadConfig } from "./storage.js";

const tableBody = document.querySelector("#trend-body");
const totalNode = document.querySelector("#weekly-total");
const averageNode = document.querySelector("#weekly-average");

const config = loadConfig();
if (!config.configured) {
  window.location.replace("./index.html");
} else {
  const rows = readRecentDays(config.schedule, 7, new Date());
  const weeklyTotal = rows.reduce((sum, row) => sum + row.fishMinutes, 0);
  const weeklyAverage = rows.length ? weeklyTotal / rows.length : 0;

  totalNode.textContent = formatMinutes(weeklyTotal);
  averageNode.textContent = formatMinutes(weeklyAverage);

  tableBody.innerHTML = "";
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const ratio = row.effectiveWorkMinutes
      ? `${((row.fishMinutes / row.effectiveWorkMinutes) * 100).toFixed(1)}%`
      : "0.0%";
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${formatMinutes(row.fishMinutes)}</td>
      <td>${ratio}</td>
    `;
    tableBody.append(tr);
  });
}
