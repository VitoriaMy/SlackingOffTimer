import { useMemo } from "react";
import { computeRatio, formatMinutes } from "../../lib/time";
import { AppLanguage, DailyStat } from "../../lib/types";
import { TrendChart } from "./TrendChart";

type TrendsPageProps = {
  language: AppLanguage;
  title: string;
  noDataHint: string;
  totalLabel: string;
  avgRatioLabel: string;
  durationLegend: string;
  ratioLegend: string;
  stats: DailyStat[];
};

export function TrendsPage({
  language,
  title,
  noDataHint,
  totalLabel,
  avgRatioLabel,
  durationLegend,
  ratioLegend,
  stats
}: TrendsPageProps) {
  const sevenDays = useMemo(() => [...stats].slice(-7).reverse(), [stats]);
  const total = sevenDays.reduce((sum, item) => sum + item.fishMinutes, 0);
  const avgRatio = sevenDays.length
    ? Number(
        (
          sevenDays.reduce((sum, item) => sum + computeRatio(item.fishMinutes, item.workMinutes), 0) /
          sevenDays.length
        ).toFixed(1)
      )
    : 0;

  return (
    <section className="card">
      <h2>{title}</h2>
      {sevenDays.length === 0 ? (
        <p className="hint">{noDataHint}</p>
      ) : (
        <>
          <div className="stats-grid compact">
            <div className="metric">
              <span className="label">{totalLabel}</span>
              <strong>{formatMinutes(total, language)}</strong>
            </div>
            <div className="metric">
              <span className="label">{avgRatioLabel}</span>
              <strong>{avgRatio}%</strong>
            </div>
          </div>

          <TrendChart
            language={language}
            durationLegend={durationLegend}
            ratioLegend={ratioLegend}
            data={[...sevenDays].reverse()}
          />
        </>
      )}
    </section>
  );
}
