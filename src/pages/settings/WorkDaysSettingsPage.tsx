import { useEffect, useState } from "react";
import { AppLanguage, WorkSchedule } from "../../../lib/types";
import { LocaleText } from "../../i18n";
import { WEEK_DAYS, normalizeSchedule, validateSchedule } from "../../schedule";

type WorkDaysSettingsPageProps = {
  text: LocaleText;
  language: AppLanguage;
  schedule: WorkSchedule;
  onSaveSchedule: (schedule: WorkSchedule) => void;
};

export function WorkDaysSettingsPage({ text, language, schedule, onSaveSchedule }: WorkDaysSettingsPageProps) {
  const [draftDays, setDraftDays] = useState<number[]>(schedule.workDays);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftDays(schedule.workDays);
  }, [schedule.workDays]);

  const toggleWorkDay = (day: number) => {
    const hasDay = draftDays.includes(day);
    const nextDays = hasDay ? draftDays.filter((item) => item !== day) : [...draftDays, day];
    setDraftDays(nextDays.sort((a, b) => a - b));
  };

  const handleSave = () => {
    const next = normalizeSchedule({ ...schedule, workDays: draftDays });
    const message = validateSchedule(next, language);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    onSaveSchedule(next);
  };

  return (
    <section className="settings-root">
      <h2 className="settings-title">{text.sectionWorkDays}</h2>
      <div className="field settings-panel">
        <span>{text.workDays}</span>
        <div className="workdays wechat-chips">
          {WEEK_DAYS.map((day) => (
            <label key={day.value} className="chip">
              <input type="checkbox" checked={draftDays.includes(day.value)} onChange={() => toggleWorkDay(day.value)} />
              <span>{language === "zh" ? day.zh : day.en}</span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="actions settings-actions">
        <button onClick={handleSave}>{text.save}</button>
      </div>
    </section>
  );
}
