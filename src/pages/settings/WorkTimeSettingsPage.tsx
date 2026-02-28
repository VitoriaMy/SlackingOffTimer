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
  const [draft, setDraft] = useState<WorkSchedule>(normalizeSchedule(schedule));
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(normalizeSchedule(schedule));
    setError("");
  }, [schedule]);

  useEffect(() => {
    const current = JSON.stringify({
      startTime: draft.startTime,
      endTime: draft.endTime,
      lunchStart: draft.lunchStart ?? "",
      lunchEnd: draft.lunchEnd ?? ""
    });
    const original = JSON.stringify({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      lunchStart: schedule.lunchStart ?? "",
      lunchEnd: schedule.lunchEnd ?? ""
    });
    onDirtyChange(current !== original);
  }, [draft.endTime, draft.lunchEnd, draft.lunchStart, draft.startTime, onDirtyChange, schedule.endTime, schedule.lunchEnd, schedule.lunchStart, schedule.startTime]);

  const handleSave = () => {
    const message = validateSchedule(draft, language);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    onSaveSchedule({ ...draft, lunchStart: draft.lunchStart || undefined, lunchEnd: draft.lunchEnd || undefined });
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
          <span>{text.lunchStart}</span>
          <input
            type="time"
            value={draft.lunchStart ?? ""}
            onChange={(event) => setDraft({ ...draft, lunchStart: event.target.value })}
          />
        </label>
        <label className="field wechat-field-row">
          <span>{text.lunchEnd}</span>
          <input
            type="time"
            value={draft.lunchEnd ?? ""}
            onChange={(event) => setDraft({ ...draft, lunchEnd: event.target.value })}
          />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
