import { useEffect, useState } from "react";
import { AppLanguage, WorkSchedule } from "../../../lib/types";
import { LocaleText } from "../../i18n";
import { normalizeSchedule, validateSchedule } from "../../schedule";

type WorkTimeSettingsPageProps = {
  text: LocaleText;
  language: AppLanguage;
  schedule: WorkSchedule;
  onSaveSchedule: (schedule: WorkSchedule) => void;
};

export function WorkTimeSettingsPage({ text, language, schedule, onSaveSchedule }: WorkTimeSettingsPageProps) {
  const [draft, setDraft] = useState<WorkSchedule>(normalizeSchedule(schedule));
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(normalizeSchedule(schedule));
  }, [schedule]);

  const handleSave = () => {
    const message = validateSchedule(draft, language);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    onSaveSchedule({ ...draft, lunchStart: draft.lunchStart || undefined, lunchEnd: draft.lunchEnd || undefined });
  };

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
      <div className="actions settings-actions">
        <button onClick={handleSave}>{text.save}</button>
      </div>
    </section>
  );
}
