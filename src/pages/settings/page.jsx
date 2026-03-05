import styles from "./page.module.scss";
import { Layout } from "@/components/layout";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { usei18n } from "@/hooks/usei18n";
import { useSettingsStore } from "@/store/settingsStore";
import { useCallback, useState } from "react";

function SettingRow({
    label,
    children,
    more
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
    value,
    onChange
}) {
    return <div></div>
}

const WEEKDAYS = ["weekSun", "weekMon", "weekTue", "weekWed", "weekThu", "weekFri", "weekSat"];


function WeekdaySelector({
    value,
    onChange
}) {
    const i18n = usei18n();
    const handleToggle = useCallback((day) => {
        // handleToggle
    }, [onChange]);
    return <div className={styles.weekdaySelector}>
        {
            WEEKDAYS.map(day => {
                return <div>{i18n(day)}</div>
            })
        }
    </div>
}

export function SettingsPage() {
    const i18n = usei18n();
    const { configured } = useSettingsStore();

    return (
        <Layout
            header={{
                left: configured ? null : {
                    children: <ArrowLeftOutlined />,
                    to: "/",
                },
                title: i18n("settings"),
            }}
        >
            <div className={styles.container}>
                <SettingRow label={i18n("workTime")}>
                    <div>TODO</div>
                </SettingRow>
                <SettingRow label={i18n("lunchTime")}>
                    <div>TODO</div>
                </SettingRow>
                <SettingRow label={i18n("workDays")}>
                    <div>TODO</div>
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