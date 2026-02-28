import { Link } from "react-router-dom";
import { AiOutlineRight } from "react-icons/ai";
import { LocaleText } from "../../i18n";

type SettingsHubProps = {
  text: LocaleText;
  isFirstSetup: boolean;
};

export function SettingsHubPage({ text, isFirstSetup }: SettingsHubProps) {
  return (
    <section className="settings-root">
      {isFirstSetup && <h2 className="settings-title">{text.setupTitle}</h2>}
      <div className="settings-group-block">
        <p className="settings-group-title">{text.settingsGroupGeneral}</p>
        <div className="settings-menu">
          <Link to="/settings/language" className="settings-link">
            <strong>{text.sectionLanguage}</strong>
            <span className="settings-arrow" aria-hidden="true">
              <AiOutlineRight />
            </span>
          </Link>
        </div>
      </div>

      <div className="settings-group-block">
        <p className="settings-group-title">{text.settingsGroupWork}</p>
        <div className="settings-menu">
          <Link to="/settings/work-time" className="settings-link">
            <strong>{text.sectionWorkTime}</strong>
            <span className="settings-arrow" aria-hidden="true">
              <AiOutlineRight />
            </span>
          </Link>
          <Link to="/settings/work-days" className="settings-link">
            <strong>{text.sectionWorkDays}</strong>
            <span className="settings-arrow" aria-hidden="true">
              <AiOutlineRight />
            </span>
          </Link>
          <Link to="/settings/holiday" className="settings-link">
            <strong>{text.sectionHoliday}</strong>
            <span className="settings-arrow" aria-hidden="true">
              <AiOutlineRight />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
