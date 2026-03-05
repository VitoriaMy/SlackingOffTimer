import styles from "./page.module.scss";
import { Layout } from "@/components/layout";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { usei18n } from "@/hooks/usei18n";
import { useSettingsStore } from "@/store/settingsStore";
import { WorkSchedule } from "../../../lib/types";

type I18nWeekdayKey = "weekSun" | "weekMon" | "weekTue" | "weekWed" | "weekThu" | "weekFri" | "weekSat";

function SettingRow({
    label,
    children,
    more
}: {
    label: string;
    children: React.ReactNode;
    more?: React.ReactNode;
}) {
    return <div className={styles.settingRow}>
        <div className={styles.label}>{label}</div>
        <div className={styles.control}>
            {children}
            {more && <div className={styles.more}>{more}</div>}
        </div>
    </div>
}

function TimeSelector({
    value
}: {
    value: string;
}) {
    return <div className={styles.timeValue}>{value || "--:--"}</div>
}

const WEEKDAYS: I18nWeekdayKey[] = ["weekSun", "weekMon", "weekTue", "weekWed", "weekThu", "weekFri", "weekSat"];


function WeekdaySelector({
    value
}: {
    value: number[];
}) {
    const i18n = usei18n();

    const activeSet = new Set(value);
    return <div className={styles.weekdaySelector}>
        {
            WEEKDAYS.map((day, index) => {
                return (
                    <div
                        key={day}
                        className={`${styles.weekdayItem}${activeSet.has(index) ? ` ${styles.active}` : ""}`}
                    >
                        {i18n(day)}
                    </div>
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
    const i18n = usei18n();
    const { configured, schedule } = useSettingsStore();

    return (
        <Layout
            header={{
                left: configured ? undefined : {
                    children: <ArrowLeftOutlined />,
                    to: "/",
                },
                title: i18n("settings"),
            }}
        >
            <div className={styles.container}>
                <SettingRow label={i18n("sectionWorkTime")}>
                    <div className={styles.timeRange}>
                        <TimeSelector value={schedule.startTime} />
                        <span className={styles.timeSep}>-</span>
                        <TimeSelector value={schedule.endTime} />
                    </div>
                </SettingRow>
                <SettingRow label={i18n("enableLunchBreak")}>
                    <div className={styles.timeValue}>{getLunchTimeText(schedule)}</div>
                </SettingRow>
                <SettingRow label={i18n("workDays")}>
                    <WeekdaySelector value={schedule.workDays} />
                </SettingRow>
            </div>
            <div className={styles.footer}>
                <div className={styles.saveButton}>
                    {configured ? i18n("save") : i18n("saveAndStart")}
                </div>
            </div>
        </Layout>
    );
}