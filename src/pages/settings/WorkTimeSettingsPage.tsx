import { useEffect, useState } from "react";
import { AppLanguage, WorkSchedule } from "../../../lib/types";
import { LocaleText } from "../../i18n";
import { normalizeSchedule, validateSchedule } from "../../schedule";

type WorkTimeSettingsPageProps = {
  text: LocaleText;
  language: AppLanguage;
  schedule: WorkSchedule;
  onSaveSchedule: (schedule: WorkSchedule) => void;
  onDirtyChange: (dirty: boolean) => void;
  onRegisterSave: (handler: (() => void) | null) => void;
};

export function WorkTimeSettingsPage({
  text,
  language,
  schedule,
  onSaveSchedule,
  onDirtyChange,
  onRegisterSave
}: WorkTimeSettingsPageProps) {
  const normalizedSchedule = normalizeSchedule(schedule);
  const [draft, setDraft] = useState<WorkSchedule>(normalizedSchedule);
  const [lunchEnabled, setLunchEnabled] = useState(Boolean(normalizedSchedule.lunchStart && normalizedSchedule.lunchEnd));
  const [lastLunchRange, setLastLunchRange] = useState({
    start: normalizedSchedule.lunchStart ?? "12:00",
    end: normalizedSchedule.lunchEnd ?? "13:00"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const normalized = normalizeSchedule(schedule);
    const hasLunch = Boolean(normalized.lunchStart && normalized.lunchEnd);
    setDraft(normalized);
    setLunchEnabled(hasLunch);
    if (hasLunch) {
      setLastLunchRange({
        start: normalized.lunchStart!,
        end: normalized.lunchEnd!
      });
    }
    setError("");
  }, [schedule]);

  const handleLunchEnabledChange = (enabled: boolean) => {
    setLunchEnabled(enabled);
    if (enabled) {
      setDraft((prev) => ({
        ...prev,
        lunchStart: prev.lunchStart ?? lastLunchRange.start,
        lunchEnd: prev.lunchEnd ?? lastLunchRange.end
      }));
      return;
    }

    setDraft((prev) => {
      if (prev.lunchStart && prev.lunchEnd) {
        setLastLunchRange({ start: prev.lunchStart, end: prev.lunchEnd });
      }
      return {
        ...prev,
        lunchStart: undefined,
        lunchEnd: undefined
      };
    });
  };

  useEffect(() => {
    const current = JSON.stringify({
      startTime: draft.startTime,
      endTime: draft.endTime,
      lunchEnabled,
      lunchStart: draft.lunchStart ?? "",
      lunchEnd: draft.lunchEnd ?? ""
    });
    const original = JSON.stringify({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      lunchEnabled: Boolean(schedule.lunchStart && schedule.lunchEnd),
      lunchStart: schedule.lunchStart ?? "",
      lunchEnd: schedule.lunchEnd ?? ""
    });
    onDirtyChange(current !== original);
  }, [
    draft.endTime,
    draft.lunchEnd,
    draft.lunchStart,
    draft.startTime,
    lunchEnabled,
    onDirtyChange,
    schedule.endTime,
    schedule.lunchEnd,
    schedule.lunchStart,
    schedule.startTime
  ]);

  const handleSave = () => {
    const message = validateSchedule(draft, language);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    onSaveSchedule({
      ...draft,
      lunchStart: lunchEnabled ? draft.lunchStart || undefined : undefined,
      lunchEnd: lunchEnabled ? draft.lunchEnd || undefined : undefined
    });
  };

  useEffect(() => {
    onRegisterSave(handleSave);
    return () => onRegisterSave(null);
  }, [onRegisterSave, handleSave]);

  return (
    <section className="settings-root">
      <h2 className="settings-title">{text.sectionWorkTime}</h2>
      <div className="settings-panel">
        <label className="field wechat-field-row">
          <span>{text.workStart}</span>
          <input type="time" value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} />
        </label>
        <label className="field wechat-field-row">
          <span>{text.workEnd}</span>
          <input type="time" value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} />
        </label>
        <label className="field wechat-field-row">
          <span>{text.enableLunchBreak}</span>
          <input
            className="lunch-toggle"
            type="checkbox"
            checked={lunchEnabled}
            onChange={(event) => handleLunchEnabledChange(event.target.checked)}
          />
        </label>
        {lunchEnabled ? (
          <>
            <label className="field wechat-field-row">
          <span>{text.lunchStartRequired}</span>
          <input
            type="time"
            value={draft.lunchStart ?? ""}
            onChange={(event) => setDraft({ ...draft, lunchStart: event.target.value })}
          />
        </label>
        <label className="field wechat-field-row">
          <span>{text.lunchEndRequired}</span>
          <input
            type="time"
            value={draft.lunchEnd ?? ""}
            onChange={(event) => setDraft({ ...draft, lunchEnd: event.target.value })}
          />
        </label>
          </>
        ) : null}
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
