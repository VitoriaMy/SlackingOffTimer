import { computeRatio } from "../../lib/time";
import { AppLanguage, DailyStat } from "../../lib/types";

type TrendChartProps = {
  language: AppLanguage;
  durationLegend: string;
  ratioLegend: string;
  data: DailyStat[];
};

export function TrendChart({ language, durationLegend, ratioLegend, data }: TrendChartProps) {
  const width = 320;
  const height = 160;
  const left = 20;
  const right = 14;
  const top = 16;
  const bottom = 24;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const maxMinutes = Math.max(...data.map((item) => item.fishMinutes), 1);
  const maxRatio = Math.max(...data.map((item) => computeRatio(item.fishMinutes, item.workMinutes)), 1);

  const durationPoints = data.map((item, index) => {
    const x = left + (innerWidth * index) / Math.max(data.length - 1, 1);
    const y = top + innerHeight - (item.fishMinutes / maxMinutes) * innerHeight;
    return { x, y, item };
  });

  const ratioPoints = data.map((item, index) => {
    const x = left + (innerWidth * index) / Math.max(data.length - 1, 1);
    const ratio = computeRatio(item.fishMinutes, item.workMinutes);
    const y = top + innerHeight - (ratio / maxRatio) * innerHeight;
    return { x, y, item };
  });

  const durationPolyline = durationPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const ratioPolyline = ratioPoints.map((point) => `${point.x},${point.y}`).join(" ");

  const shortDate = (date: string) => {
    const day = date.slice(8, 10);
    return language === "zh" ? `${day}日` : day;
  };

  return (
    <div className="trend-chart" aria-label={language === "zh" ? "最近7天趋势图" : "7-day trend chart"}>
      <div className="trend-legend">
        <span className="legend-item duration">{durationLegend}</span>
        <span className="legend-item ratio">{ratioLegend}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <line x1={left} y1={top + innerHeight} x2={width - right} y2={top + innerHeight} className="axis" />
        <line x1={left} y1={top} x2={left} y2={top + innerHeight} className="axis" />
        <line x1={width - right} y1={top} x2={width - right} y2={top + innerHeight} className="axis" />
        <polyline points={durationPolyline} className="trend-line duration" />
        <polyline points={ratioPolyline} className="trend-line ratio" />
        {durationPoints.map((point) => (
          <g key={point.item.date}>
            <circle cx={point.x} cy={point.y} r="3" className="trend-dot duration" />
            <text x={point.x} y={height - 8} textAnchor="middle" className="x-label">
              {shortDate(point.item.date)}
            </text>
          </g>
        ))}
        {ratioPoints.map((point) => (
          <circle key={`${point.item.date}-ratio`} cx={point.x} cy={point.y} r="2.6" className="trend-dot ratio" />
        ))}
        <text x={left + 2} y={top + 9} className="y-label left">{`${maxMinutes}m`}</text>
        <text x={width - right - 2} y={top + 9} className="y-label right">{`${maxRatio}%`}</text>
      </svg>
    </div>
  );
}
