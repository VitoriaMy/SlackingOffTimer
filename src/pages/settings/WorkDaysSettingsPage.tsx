import { useEffect, useMemo, useState } from "react";
import { AppLanguage, WorkSchedule } from "../../../lib/types";
import { LocaleText } from "../../i18n";
import { WEEK_DAYS, normalizeSchedule, validateSchedule } from "../../schedule";

type WorkDaysSettingsPageProps = {
  text: LocaleText;
  language: AppLanguage;
  schedule: WorkSchedule;
  onSaveSchedule: (schedule: WorkSchedule) => void;
  onDirtyChange: (dirty: boolean) => void;
  onRegisterSave: (handler: (() => void) | null) => void;
};

export function WorkDaysSettingsPage({
  text,
  language,
  schedule,
  onSaveSchedule,
  onDirtyChange,
  onRegisterSave
}: WorkDaysSettingsPageProps) {
  const [draftDays, setDraftDays] = useState<number[]>(schedule.workDays);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftDays(schedule.workDays);
    setError("");
  }, [schedule.workDays]);

  const sortedDraftDays = useMemo(() => [...draftDays].sort((a, b) => a - b), [draftDays]);
  const sortedWorkDays = useMemo(() => [...schedule.workDays].sort((a, b) => a - b), [schedule.workDays]);

  useEffect(() => {
    onDirtyChange(JSON.stringify(sortedDraftDays) !== JSON.stringify(sortedWorkDays));
  }, [onDirtyChange, sortedDraftDays, sortedWorkDays]);

  const toggleWorkDay = (day: number) => {
    const hasDay = draftDays.includes(day);
    const nextDays = hasDay ? draftDays.filter((item) => item !== day) : [...draftDays, day];
    setDraftDays(nextDays.sort((a, b) => a - b));
  };

  const handleSave = () => {
    const next = normalizeSchedule({ ...schedule, workDays: sortedDraftDays });
    const message = validateSchedule(next, language);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    onSaveSchedule(next);
  };

  useEffect(() => {
    onRegisterSave(handleSave);
    return () => onRegisterSave(null);
  }, [handleSave, onRegisterSave]);

  return (
    <section className="settings-root">
      <h2 className="settings-title">{text.sectionWorkDays}</h2>
      <div className="settings-panel">
        {WEEK_DAYS.map((day) => {
          const checked = draftDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              className={`wechat-field-row language-option${checked ? " active" : ""}`}
              onClick={() => toggleWorkDay(day.value)}
              aria-pressed={checked}
            >
              <span>{language === "zh" ? day.zh : day.en}</span>
              <span className="language-option-indicator" aria-hidden="true">
                {checked ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
