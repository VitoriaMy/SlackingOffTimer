import styles from "./page.module.scss";
import { Layout } from "@/components/layout";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { MoodSwitch } from "@/components/MoodSwitch";
import { BottonSwitch } from "@/components/BottonSwitch";
import { usei18n } from "@/hooks/usei18n";
import { useSettingsStore } from "@/store/settingsStore";
import { validateSchedule } from "@/schedule";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingRow } from "@/components/SettingRow";
import { WorkSchedule } from "../../../lib/types";

type I18nWeekdayKey = "weekSun" | "weekMon" | "weekTue" | "weekWed" | "weekThu" | "weekFri" | "weekSat";


function TimeSelector({
    value,
    onClick
}: {
    value: string;
    onClick?: () => void;
}) {
    return <button type="button" className={styles.timeValue} onClick={onClick}>{value || "--:--"}</button>
}

const WORK_START_OPTIONS = ["08:30", "09:00", "09:30", "10:00"];
const WORK_END_OPTIONS = ["18:00", "18:30", "19:00", "19:30"];
const LUNCH_START_OPTIONS = ["11:30", "12:00", "12:30", "13:00"];
const LUNCH_END_OPTIONS = ["13:00", "13:30", "14:00", "14:30"];

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

    const cycleTime = (value: string, options: string[]) => {
        const index = options.indexOf(value);
        return options[(index + 1 + options.length) % options.length];
    };

    const updateDraft = (next: Partial<WorkSchedule>) => {
        setDraft((current) => ({ ...current, ...next }));
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
                lunchStart: current.lunchStart ?? "12:00",
                lunchEnd: current.lunchEnd ?? "13:00",
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
                left: {
                    children: <ArrowLeftOutlined />,
                    to: "/",
                },
                title: i18n("settings"),
            }}
        >
            <div className={styles.container}>
                <SettingRow label={workTimeLabel}>
                    <div className={styles.timeRange}>
                        <TimeSelector value={draft.startTime} onClick={() => updateDraft({ startTime: cycleTime(draft.startTime, WORK_START_OPTIONS) })} />
                        <TimeSelector value={draft.endTime} onClick={() => updateDraft({ endTime: cycleTime(draft.endTime, WORK_END_OPTIONS) })} />
                    </div>
                </SettingRow>
                <SettingRow
                    label={lunchLabel}
                    more={<MoodSwitch checked={Boolean(draft.lunchStart && draft.lunchEnd)} onClick={toggleLunchBreak} />}
                >
                    <div className={styles.timeRange}>
                        {draft.lunchStart ? <TimeSelector value={draft.lunchStart} onClick={() => updateDraft({ lunchStart: cycleTime(draft.lunchStart || "12:00", LUNCH_START_OPTIONS) })} /> : <div className={styles.timeValue}>{getLunchTimeText(draft)}</div>}
                        {draft.lunchEnd ? <TimeSelector value={draft.lunchEnd} onClick={() => updateDraft({ lunchEnd: cycleTime(draft.lunchEnd || "13:00", LUNCH_END_OPTIONS) })} /> : <div className={styles.timeValue}>{getLunchTimeText(draft)}</div>}
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