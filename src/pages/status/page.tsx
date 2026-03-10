import { Layout } from "@/components/layout";
import styles from "./style.module.scss";
import { useSettingsStore } from "@/store/settingsStore";
import { useDaySwitchRecords } from "@/hooks/useDaySwitchRecords";
import { useEffectiveScheduleByDate } from "@/hooks/useEffectiveScheduleByDate";
import { useEffect, useMemo, useState } from "react";

function formatDayKey(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatDayLabel(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${mm}-${dd}`;
}

function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatScheduleSummary(startTime: string, endTime: string, lunchStart?: string, lunchEnd?: string): string {
    const lunchText = lunchStart && lunchEnd ? `${lunchStart}-${lunchEnd}` : "无";
    return `工作 ${startTime}-${endTime} / 午休 ${lunchText}`;
}

export function StautsPage() {
    const {
        configured,
        schedule,
        language,
        reloadSlackingRecords,
        reloadScheduleHistory,
    } = useSettingsStore();

    useEffect(() => {
        reloadSlackingRecords();
        reloadScheduleHistory();
    }, [reloadScheduleHistory, reloadSlackingRecords]);

    const dateTabs = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(now);
            date.setHours(0, 0, 0, 0);
            date.setDate(now.getDate() - index);

            return {
                key: formatDayKey(date),
                label: index === 0 ? "今天" : formatDayLabel(date),
            };
        });
    }, []);

    const [activeDayKey, setActiveDayKey] = useState(dateTabs[0]?.key ?? "");

    useEffect(() => {
        if (!dateTabs.some((tab) => tab.key === activeDayKey)) {
            setActiveDayKey(dateTabs[0]?.key ?? "");
        }
    }, [activeDayKey, dateTabs]);

    const { daySwitchRecords: activeDaySwitchRecords } = useDaySwitchRecords(activeDayKey);
    const { effectiveScheduleForDay: effectiveScheduleForActiveDay } = useEffectiveScheduleByDate(activeDayKey);

    return <Layout
        header={{
            title: "历史状态",
        }}
    >
        <button className={styles.button}
            onClick={() => {
                console.log("Current configuration:", {
                    configured,
                    schedule,
                    language,
                });
            }}
        > 输出当前配置 </button>

        <div className={styles.list}>
            <div className={styles.tit}>最近七天状态切换明细</div>
            <div className={styles.tabs}>
                {dateTabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={`${styles.tab} ${tab.key === activeDayKey ? styles.tabActive : ""}`}
                        onClick={() => setActiveDayKey(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className={styles.listContent}>
                {activeDaySwitchRecords.length === 0 ? (
                    <div className={styles.empty}>暂无记录</div>
                ) : (
                    activeDaySwitchRecords.map((record) => (
                        <div key={`${record.timestamp}-${record.switchState}`} className={styles.li}>
                            <span>{formatDateTime(record.timestamp)}</span>
                            <span className={styles.tag}>{record.switchState === 1 ? "开" : "关"}</span>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className={styles.list}>
            <div className={styles.tit}>设置</div>
            <div className={styles.listContent}>
                {!effectiveScheduleForActiveDay ? (
                    <div className={styles.empty}>暂无记录</div>
                ) : (
                    <div
                        key={`${effectiveScheduleForActiveDay.startAt ?? 0}-${effectiveScheduleForActiveDay.endAt ?? 0}`}
                        className={styles.liCol}
                    >
                        <div className={styles.liTop}>
                            <span>{effectiveScheduleForActiveDay.isCurrent ? "当前生效设置" : "历史设置"}</span>
                        </div>
                        <div className={styles.summary}>开始日期：{effectiveScheduleForActiveDay.startAt ? formatDate(effectiveScheduleForActiveDay.startAt) : "未记录"}</div>
                        <div className={styles.summary}>结束日期：{effectiveScheduleForActiveDay.isCurrent ? "--" : effectiveScheduleForActiveDay.endAt ? formatDate(effectiveScheduleForActiveDay.endAt) : "--"}</div>
                        <div className={styles.summary}>
                            {formatScheduleSummary(
                                effectiveScheduleForActiveDay.schedule.startTime,
                                effectiveScheduleForActiveDay.schedule.endTime,
                                effectiveScheduleForActiveDay.schedule.lunchStart,
                                effectiveScheduleForActiveDay.schedule.lunchEnd,
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </Layout>;
}