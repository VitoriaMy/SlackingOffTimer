import { formatMinutes } from "../../lib/time";
import { AppLanguage } from "../../lib/types";
import { HourglassSvg } from "../components/HourglassSvg";

type TodayPageProps = {
  language: AppLanguage;
  title: string;
  fishDuration: string;
  fishRatio: string;
  statusLabel: string;
  startLabel: string;
  stopLabel: string;
  offWorkHint: string;
  fishMinutes: number;
  ratio: number;
  statusText: string;
  isTracking: boolean;
  canTrackNow: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function TodayPage({
  language,
  title,
  fishDuration,
  fishRatio,
  statusLabel,
  startLabel,
  stopLabel,
  offWorkHint,
  fishMinutes,
  ratio,
  statusText,
  isTracking,
  canTrackNow,
  onStart,
  onStop
}: TodayPageProps) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="stats-grid">
        <div className="metric">
          <span className="label">{fishDuration}</span>
          <strong>{formatMinutes(fishMinutes, language)}</strong>
        </div>
        <div className="metric">
          <span className="label">{fishRatio}</span>
          <strong>{ratio}%</strong>
        </div>
        <div className="metric">
          <span className="label">{statusLabel}</span>
          <strong>{statusText}</strong>
        </div>
      </div>

      <div className="actions">
        <button onClick={isTracking ? onStop : onStart} disabled={!isTracking && !canTrackNow}>
          {isTracking ? stopLabel : startLabel}
        </button>
      </div>

      {!canTrackNow && <p className="hint">{offWorkHint}</p>}

      <div className="today-hourglass">
        <HourglassSvg percent={ratio} width={160} height={220} className="today-hourglass-svg" />
      </div>
    </section>
  );
}
