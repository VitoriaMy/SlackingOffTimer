import { Layout } from "@/components/layout";
import styles from "./style.module.scss";
import { useSettingsStore } from "@/store/settingsStore";
import { useEffect, useMemo, useState } from "react";
import type { WorkSchedule } from "../../../lib/types";

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

function getDayRangeByKey(dayKey: string): { start: number; end: number } | null {
    const date = new Date(`${dayKey}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const start = date.getTime();
    const end = start + 24 * 60 * 60 * 1000 - 1;
    return { start, end };
}

function formatScheduleSummary(startTime: string, endTime: string, lunchStart?: string, lunchEnd?: string): string {
    const lunchText = lunchStart && lunchEnd ? `${lunchStart}-${lunchEnd}` : "无";
    return `工作 ${startTime}-${endTime} / 午休 ${lunchText}`;
}

type SchedulePeriodItem = {
    startAt: number | null;
    endAt: number | null;
    isCurrent: boolean;
    schedule: WorkSchedule;
};

export function StautsPage() {
    const {
        configured,
        schedule,
        language,
        slackingRecords,
        scheduleHistory,
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

    const recentSwitchRecords = useMemo(
        () => [...slackingRecords].sort((a, b) => b.timestamp - a.timestamp),
        [slackingRecords],
    );

    const activeDaySwitchRecords = useMemo(
        () => recentSwitchRecords.filter((record) => formatDayKey(new Date(record.timestamp)) === activeDayKey),
        [activeDayKey, recentSwitchRecords],
    );

    const schedulePeriods = useMemo<SchedulePeriodItem[]>(() => {
        const sorted = [...scheduleHistory].sort((a, b) => a.savedAt - b.savedAt);

        if (sorted.length === 0) {
            return [{
                startAt: null,
                endAt: null,
                isCurrent: true,
                schedule,
            }];
        }

        return sorted.map((item, index) => {
            const next = sorted[index + 1];
            return {
                startAt: item.savedAt,
                endAt: next ? next.savedAt : null,
                isCurrent: !next,
                schedule: item.schedule,
            };
        });
    }, [schedule, scheduleHistory]);

    const displayScheduleHistory = useMemo(() => {
        const range = getDayRangeByKey(activeDayKey);
        if (!range) {
            return [] as SchedulePeriodItem[];
        }

        return schedulePeriods.filter((item) => {
            const startAt = item.startAt ?? Number.NEGATIVE_INFINITY;
            const endAt = item.endAt ?? Number.POSITIVE_INFINITY;
            return startAt <= range.end && endAt >= range.start;
        });
    }, [activeDayKey, schedulePeriods]);

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
            <div className={styles.tit}>最近七天设置</div>
            <div className={styles.listContent}>
                {displayScheduleHistory.length === 0 ? (
                    <div className={styles.empty}>暂无记录</div>
                ) : (
                    displayScheduleHistory.map((item, index) => (
                        <div key={`${item.startAt ?? 0}-${item.endAt ?? 0}-${index}`} className={styles.liCol}>
                            <div className={styles.liTop}>
                                <span>{item.isCurrent ? "当前生效设置" : "历史设置"}</span>
                                <span className={styles.tag}>{item.isCurrent ? "当前" : "保存"}</span>
                            </div>
                            <div className={styles.summary}>开始日期：{item.startAt ? formatDate(item.startAt) : "未记录"}</div>
                            <div className={styles.summary}>结束日期：{item.isCurrent ? "--" : item.endAt ? formatDate(item.endAt) : "--"}</div>
                            <div className={styles.summary}>
                                {formatScheduleSummary(
                                    item.schedule.startTime,
                                    item.schedule.endTime,
                                    item.schedule.lunchStart,
                                    item.schedule.lunchEnd,
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </Layout>;
}