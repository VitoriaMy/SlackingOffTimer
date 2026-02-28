import { useEffect, useState } from "react";
import { AppLanguage } from "../../../lib/types";
import { LocaleText } from "../../i18n";

type LanguageSettingsPageProps = {
  text: LocaleText;
  language: AppLanguage;
  onSaveLanguage: (language: AppLanguage) => void;
};

export function LanguageSettingsPage({ text, language, onSaveLanguage }: LanguageSettingsPageProps) {
  const [draftLanguage, setDraftLanguage] = useState<AppLanguage>(language);

  useEffect(() => {
    setDraftLanguage(language);
  }, [language]);

  return (
    <section className="settings-root">
      <h2 className="settings-title">{text.sectionLanguage}</h2>
      <div className="field wechat-field-row">
        <span>{text.language}</span>
        <select value={draftLanguage} onChange={(event) => setDraftLanguage(event.target.value as AppLanguage)}>
          <option value="zh">{text.languageZh}</option>
          <option value="en">{text.languageEn}</option>
        </select>
      </div>
      <div className="actions settings-actions">
        <button onClick={() => onSaveLanguage(draftLanguage)}>{text.save}</button>
      </div>
    </section>
  );
}
