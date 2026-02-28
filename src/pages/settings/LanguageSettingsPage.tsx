import { useEffect, useState } from "react";
import { AppLanguage } from "../../../lib/types";
import { LocaleText } from "../../i18n";

type LanguageSettingsPageProps = {
  text: LocaleText;
  language: AppLanguage;
  onDraftLanguageChange: (language: AppLanguage) => void;
};

const LANGUAGE_OPTIONS: AppLanguage[] = ["zh", "en"];

export function LanguageSettingsPage({ text, language, onDraftLanguageChange }: LanguageSettingsPageProps) {
  const [draftLanguage, setDraftLanguage] = useState<AppLanguage>(language);

  useEffect(() => {
    setDraftLanguage(language);
  }, [language]);

  useEffect(() => {
    onDraftLanguageChange(draftLanguage);
  }, [draftLanguage, onDraftLanguageChange]);

  const getLanguageLabel = (value: AppLanguage) => (value === "zh" ? text.languageZh : text.languageEn);

  return (
    <section className="settings-root">
      <div className="settings-panel">
        {LANGUAGE_OPTIONS.map((option) => {
          const checked = option === draftLanguage;
          return (
            <button
              key={option}
              type="button"
              className={`wechat-field-row language-option${checked ? " active" : ""}`}
              onClick={() => setDraftLanguage(option)}
              aria-pressed={checked}
            >
              <span>{getLanguageLabel(option)}</span>
              <span className="language-option-indicator" aria-hidden="true">
                {checked ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
