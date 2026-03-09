import styles from "./page.module.scss";
import { Layout } from "@/components/layout";
import { MoodSwitch } from "@/components/MoodSwitch";
import { BottonSwitch } from "@/components/BottonSwitch";
import { usei18n } from "@/hooks/usei18n";
import { useSettingsStore } from "@/store/settingsStore";
import { validateSchedule } from "@/schedule";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingRow } from "@/components/SettingRow";
import { Timer } from "@/components/timer";
import type { WorkSchedule } from "../../../lib/types";

type I18nWeekdayKey = "weekSun" | "weekMon" | "weekTue" | "weekWed" | "weekThu" | "weekFri" | "weekSat";


function toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function fromMinutes(total: number): string {
    const safe = Math.max(0, Math.min(total, 23 * 60 + 59));
    const h = Math.floor(safe / 60);
    const m = safe % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function clampTime(value: string, min: string, max: string): string {
    const minutes = toMinutes(value);
    const minMinutes = toMinutes(min);
    const maxMinutes = toMinutes(max);

    if (minutes < minMinutes) {
        return min;
    }

    if (minutes > maxMinutes) {
        return max;
    }

    return value;
}

const WEEKDAYS: { key: I18nWeekdayKey; index: number }[] = [
    { key: "weekMon", index: 1 },
    { key: "weekTue", index: 2 },
    { key: "weekWed", index: 3 },
    { key: "weekThu", index: 4 },
    { key: "weekFri", index: 5 },
    { key: "weekSat", index: 6 },
    { key: "weekSun", index: 0 },
];

function formatWeekdayLabel(label: string, isZh: boolean) {
    if (!isZh) {
        return label;
    }

    if (label === "六") {
        return <>周<br />六</>;
    }

    if (label.length === 2) {
        return <>{label.slice(0, 1)}<br />{label.slice(1)}</>;
    }

    return label;
}

function WeekdaySelector({
    value,
    isZh,
    onToggle
}: {
    value: number[];
    isZh: boolean;
    onToggle: (dayIndex: number) => void;
}) {
    const i18n = usei18n();

    const activeSet = new Set(value);
    return <div className={styles.weekdaySelector}>
        {
            WEEKDAYS.map((day) => {
                return (
                    <BottonSwitch
                        key={day.index}
                        checked={activeSet.has(day.index)}
                        label={i18n(day.key)}
                        onClick={() => onToggle(day.index)}
                    />
                )
            })
        }
    </div>
}

function getLunchTimeText(schedule: WorkSchedule): string {
    if (!schedule.lunchStart || !schedule.lunchEnd) {
        return "-";
    }
    return `${schedule.lunchStart}-${schedule.lunchEnd}`;
}

export function SettingsPage() {
    const navigate = useNavigate();
    const i18n = usei18n();
    const { configured, schedule, language, updateSchedule } = useSettingsStore();
    const isZh = language === "zh";
    const [draft, setDraft] = useState<WorkSchedule>(schedule);

    useEffect(() => {
        setDraft(schedule);
    }, [schedule]);

    const workTimeLabel = isZh ? "工作时间" : i18n("sectionWorkTime");
    const lunchLabel = isZh ? "午休时间" : i18n("enableLunchBreak");
    const workDaysLabel = isZh ? "工作日选择" : i18n("sectionWorkDays");
    const submitLabel = configured ? i18n("save") : isZh ? "开始摸鱼吧" : i18n("saveAndStart");

    const updateDraft = (next: Partial<WorkSchedule>) => {
        setDraft((current) => ({ ...current, ...next }));
    };

    const handleStartTimeChange = (nextStart: string) => {
        setDraft((current) => {
            const endTime = toMinutes(nextStart) > toMinutes(current.endTime) ? nextStart : current.endTime;

            const next: WorkSchedule = {
                ...current,
                startTime: nextStart,
                endTime,
            };

            if (next.lunchStart && next.lunchEnd) {
                const safeLunchStart = clampTime(next.lunchStart, next.startTime, next.endTime);
                const safeLunchEnd = clampTime(next.lunchEnd, safeLunchStart, next.endTime);
                next.lunchStart = safeLunchStart;
                next.lunchEnd = safeLunchEnd;
            }

            return next;
        });
    };

    const handleEndTimeChange = (nextEnd: string) => {
        setDraft((current) => {
            const startTime = toMinutes(nextEnd) < toMinutes(current.startTime) ? nextEnd : current.startTime;

            const next: WorkSchedule = {
                ...current,
                startTime,
                endTime: nextEnd,
            };

            if (next.lunchStart && next.lunchEnd) {
                const safeLunchStart = clampTime(next.lunchStart, next.startTime, next.endTime);
                const safeLunchEnd = clampTime(next.lunchEnd, safeLunchStart, next.endTime);
                next.lunchStart = safeLunchStart;
                next.lunchEnd = safeLunchEnd;
            }

            return next;
        });
    };

    const handleLunchStartChange = (nextLunchStart: string) => {
        setDraft((current) => {
            if (!current.lunchStart || !current.lunchEnd) {
                return current;
            }

            const lunchStart = clampTime(nextLunchStart, current.startTime, current.endTime);
            const lunchEnd = toMinutes(current.lunchEnd) < toMinutes(lunchStart) ? lunchStart : current.lunchEnd;

            return {
                ...current,
                lunchStart,
                lunchEnd,
            };
        });
    };

    const handleLunchEndChange = (nextLunchEnd: string) => {
        setDraft((current) => {
            if (!current.lunchStart || !current.lunchEnd) {
                return current;
            }

            const lunchEnd = clampTime(nextLunchEnd, current.startTime, current.endTime);
            const lunchStart = toMinutes(current.lunchStart) > toMinutes(lunchEnd) ? lunchEnd : current.lunchStart;

            return {
                ...current,
                lunchStart,
                lunchEnd,
            };
        });
    };

    const toggleWorkDay = (dayIndex: number) => {
        setDraft((current) => {
            const exists = current.workDays.includes(dayIndex);
            const workDays = exists
                ? current.workDays.filter((item) => item !== dayIndex)
                : [...current.workDays, dayIndex].sort((left, right) => left - right);

            return {
                ...current,
                workDays,
            };
        });
    };

    const toggleLunchBreak = () => {
        setDraft((current) => {
            if (current.lunchStart && current.lunchEnd) {
                return {
                    ...current,
                    lunchStart: undefined,
                    lunchEnd: undefined,
                };
            }

            return {
                ...current,
                lunchStart: current.lunchStart ?? fromMinutes(Math.max(toMinutes(current.startTime), 12 * 60)),
                lunchEnd: current.lunchEnd ?? fromMinutes(Math.min(toMinutes(current.endTime), 13 * 60)),
            };
        });
    };

    const handleSave = () => {
        const message = validateSchedule(draft, language);
        if (message) {
            window.alert(message);
            return;
        }

        updateSchedule(draft, true);
        navigate("/");
    };

    return (
        <Layout
            header={{
                title: i18n("settings"),
            }}
        >
            <div className={styles.container}>
                <SettingRow label={workTimeLabel}>
                    <div className={styles.timeRange}>
                        <Timer
                            className={styles.timeValue}
                            value={draft.startTime}
                            minTime="00:00"
                            maxTime={draft.endTime}
                            onChange={handleStartTimeChange}
                        />
                        <Timer
                            className={styles.timeValue}
                            value={draft.endTime}
                            minTime={draft.startTime}
                            maxTime="23:59"
                            onChange={handleEndTimeChange}
                        />
                    </div>
                </SettingRow>
                <SettingRow
                    label={lunchLabel}
                    more={<MoodSwitch checked={Boolean(draft.lunchStart && draft.lunchEnd)} onClick={toggleLunchBreak} />}
                >
                    <div className={styles.timeRange}>
                        {draft.lunchStart && draft.lunchEnd ? (
                            <Timer
                                className={styles.timeValue}
                                value={draft.lunchStart}
                                minTime={draft.startTime}
                                maxTime={draft.lunchEnd}
                                onChange={handleLunchStartChange}
                            />
                        ) : (
                            <div className={styles.timeValue}>{getLunchTimeText(draft)}</div>
                        )}
                        {draft.lunchStart && draft.lunchEnd ? (
                            <Timer
                                className={styles.timeValue}
                                value={draft.lunchEnd}
                                minTime={draft.lunchStart}
                                maxTime={draft.endTime}
                                onChange={handleLunchEndChange}
                            />
                        ) : (
                            <div className={styles.timeValue}>{getLunchTimeText(draft)}</div>
                        )}
                    </div>
                </SettingRow>
                <SettingRow label={workDaysLabel}>
                    <WeekdaySelector value={draft.workDays} isZh={isZh} onToggle={toggleWorkDay} />
                </SettingRow>
            </div>
            <div className={styles.footer}>
                <button type="button" className={styles.saveButton} onClick={handleSave}>
                    {submitLabel}
                </button>
            </div>
        </Layout>
    );
}