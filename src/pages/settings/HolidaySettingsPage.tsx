import { useEffect, useRef, useState } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { WorkSchedule } from "../../../lib/types";
import { LocaleText } from "../../i18n";
import { dateKey, normalizeSchedule } from "../../schedule";

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const monthLabel = (date: Date, language: "zh" | "en"): string => {
  if (language === "zh") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const monthPickerLabel = (date: Date): string => `${date.getFullYear()}年/${date.getMonth() + 1}月`;

const monthKey = (date: Date): number => date.getFullYear() * 12 + date.getMonth();
const addMonths = (date: Date, delta: number): Date => new Date(date.getFullYear(), date.getMonth() + delta, 1);
const MONTH_ITEM_HEIGHT = 42;

const buildMonthRange = (min: Date, max: Date): Date[] => {
  const total = monthKey(max) - monthKey(min) + 1;
  return Array.from({ length: Math.max(total, 0) }, (_, index) => addMonths(min, index));
};

type HolidaySettingsPageProps = {
  text: LocaleText;
  schedule: WorkSchedule;
  onSaveSchedule: (schedule: WorkSchedule) => void;
};

export function HolidaySettingsPage({ text, schedule, onSaveSchedule }: HolidaySettingsPageProps) {
  const [cursorMonth, setCursorMonth] = useState(startOfMonth(new Date()));
  const [pickerMonth, setPickerMonth] = useState(startOfMonth(new Date()));
  const [dayOverrides, setDayOverrides] = useState<Record<string, "work" | "rest">>(schedule.dayOverrides ?? {});
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement | null>(null);
  const isAdjustingScrollRef = useRef(false);
  const scrollEndTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setDayOverrides(schedule.dayOverrides ?? {});
  }, [schedule.dayOverrides]);

  const persistOverrides = (nextOverrides: Record<string, "work" | "rest">) => {
    onSaveSchedule({
      ...normalizeSchedule(schedule),
      dayOverrides: nextOverrides,
      holidays: Object.keys(nextOverrides)
        .filter((date) => nextOverrides[date] === "rest")
        .sort()
    });
  };

  const isDefaultWork = (date: Date): boolean => {
    return schedule.workDays.includes(date.getDay());
  };

  const getStatus = (date: Date): "work" | "rest" => {
    const key = dateKey(date);
    const override = dayOverrides[key];
    if (override) return override;
    return isDefaultWork(date) ? "work" : "rest";
  };

  const toggleDayStatus = (date: Date) => {
    const key = dateKey(date);
    const defaultStatus: "work" | "rest" = isDefaultWork(date) ? "work" : "rest";
    const currentStatus = dayOverrides[key] ?? defaultStatus;
    const nextStatus: "work" | "rest" = currentStatus === "work" ? "rest" : "work";

    setDayOverrides((prev) => {
      const next = { ...prev };
      if (nextStatus === defaultStatus) {
        delete next[key];
      } else {
        next[key] = nextStatus;
      }
      persistOverrides(next);
      return next;
    });
  };

  const currentYear = cursorMonth.getFullYear();
  const currentMonth = cursorMonth.getMonth();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const leadEmpty = (firstDay.getDay() + 6) % 7;

  const cells: Array<Date | null> = [
    ...Array.from({ length: leadEmpty }).map(() => null),
    ...Array.from({ length: daysInMonth }).map((_, index) => new Date(currentYear, currentMonth, index + 1))
  ];

  const weekLabels = [text.weekMon, text.weekTue, text.weekWed, text.weekThu, text.weekFri, text.weekSat, text.weekSun];
  const isZh = text.appTitle.includes("摸鱼");
  const now = new Date();
  const maxMonthDate = new Date(now.getFullYear(), now.getMonth() + 12, 1);
  const minMonthDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthOptions = buildMonthRange(minMonthDate, maxMonthDate);
  const loopedMonthOptions = [...monthOptions, ...monthOptions, ...monthOptions];
  const selectedMonthIndex = Math.max(
    0,
    monthOptions.findIndex((month) => monthKey(month) === monthKey(pickerMonth))
  );
  const isAtMinMonth = monthKey(cursorMonth) <= monthKey(minMonthDate);
  const isAtMaxMonth = monthKey(cursorMonth) >= monthKey(maxMonthDate);

  useEffect(() => {
    if (!isMonthModalOpen || !monthPickerRef.current) return;
    const targetIndex = monthOptions.length + selectedMonthIndex;
    monthPickerRef.current.scrollTop = targetIndex * MONTH_ITEM_HEIGHT;
  }, [isMonthModalOpen, monthOptions.length, selectedMonthIndex]);

  useEffect(() => {
    if (isMonthModalOpen) return;
    if (scrollEndTimerRef.current) {
      window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = null;
    }
  }, [isMonthModalOpen]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);

  const normalizeMonthIndex = (index: number): number => {
    if (monthOptions.length === 0) return 0;
    return ((index % monthOptions.length) + monthOptions.length) % monthOptions.length;
  };

  const handleMonthPickerScroll = () => {
    const picker = monthPickerRef.current;
    if (!picker || monthOptions.length === 0 || isAdjustingScrollRef.current) return;

    const nearestLoopIndex = Math.round(picker.scrollTop / MONTH_ITEM_HEIGHT);
    const normalized = normalizeMonthIndex(nearestLoopIndex);
    setPickerMonth(monthOptions[normalized]);

    const lowerBound = monthOptions.length * 0.5;
    const upperBound = monthOptions.length * 2.5;
    if (nearestLoopIndex < lowerBound || nearestLoopIndex > upperBound) {
      isAdjustingScrollRef.current = true;
      const reboundIndex = monthOptions.length + normalized;
      picker.scrollTop = reboundIndex * MONTH_ITEM_HEIGHT;
      requestAnimationFrame(() => {
        isAdjustingScrollRef.current = false;
      });
    }

    if (scrollEndTimerRef.current) {
      window.clearTimeout(scrollEndTimerRef.current);
    }
    scrollEndTimerRef.current = window.setTimeout(() => {
      const currentPicker = monthPickerRef.current;
      if (!currentPicker) return;

      const settledLoopIndex = Math.round(currentPicker.scrollTop / MONTH_ITEM_HEIGHT);
      const settledNormalized = normalizeMonthIndex(settledLoopIndex);
      const settledMonth = monthOptions[settledNormalized];
      const settleIndex = monthOptions.length + settledNormalized;

      isAdjustingScrollRef.current = true;
      currentPicker.scrollTop = settleIndex * MONTH_ITEM_HEIGHT;
      requestAnimationFrame(() => {
        isAdjustingScrollRef.current = false;
      });

      setPickerMonth(settledMonth);
      if (monthKey(settledMonth) !== monthKey(cursorMonth)) {
        setCursorMonth(settledMonth);
      }
    }, 120);
  };

  return (
    <section className="settings-root">
      <h2 className="settings-title">{text.sectionHoliday}</h2>
      <div className="field settings-panel">
        <div className="calendar-toolbar">
          {isAtMinMonth ? (
            <span className="calendar-nav-placeholder" aria-hidden="true" />
          ) : (
            <button
              type="button"
              className="calendar-nav"
              aria-label="previous-month"
              onClick={() => setCursorMonth(new Date(currentYear, currentMonth - 1, 1))}
            >
              <AiOutlineLeft />
            </button>
          )}
          <button
            type="button"
            className="calendar-month-btn"
            onClick={() => {
              setPickerMonth(cursorMonth);
              setIsMonthModalOpen(true);
            }}
          >
            {monthLabel(cursorMonth, isZh ? "zh" : "en")}
          </button>
          {isAtMaxMonth ? (
            <span className="calendar-nav-placeholder" aria-hidden="true" />
          ) : (
            <button
              type="button"
              className="calendar-nav"
              aria-label="next-month"
              onClick={() => setCursorMonth(new Date(currentYear, currentMonth + 1, 1))}
            >
              <AiOutlineRight />
            </button>
          )}
        </div>

        <div className="calendar-week-head">
          {weekLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((cell, index) => {
            if (!cell) {
              return <span key={`empty-${index}`} className="calendar-cell empty" />;
            }

            const status = getStatus(cell);
            const today = dateKey(cell) === dateKey(new Date());

            return (
              <button
                key={dateKey(cell)}
                type="button"
                className={`calendar-cell ${status} ${today ? "today" : ""}`}
                onClick={() => toggleDayStatus(cell)}
              >
                <span className="day-num">{cell.getDate()}</span>
                <span className="day-tag">{status === "work" ? text.workTag : text.restTag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isMonthModalOpen && (
        <div className="month-modal-mask" onClick={() => setIsMonthModalOpen(false)}>
          <div className="month-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="month-picker-window">
              <div className="month-picker-fade month-picker-fade-top" aria-hidden="true" />
              <div className="month-picker-fade month-picker-fade-bottom" aria-hidden="true" />
              <div className="month-picker-highlight" aria-hidden="true" />
              <div className="month-picker-list" ref={monthPickerRef} onScroll={handleMonthPickerScroll}>
                {loopedMonthOptions.map((month, index) => {
                  const selected = monthKey(month) === monthKey(pickerMonth);
                  return (
                    <button
                      key={`${monthKey(month)}-${index}`}
                      type="button"
                      className={`month-picker-item ${selected ? "active" : ""}`}
                      onClick={() => {
                        setPickerMonth(month);
                        setCursorMonth(month);
                        setIsMonthModalOpen(false);
                      }}
                    >
                      {monthPickerLabel(month)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
