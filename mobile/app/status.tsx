import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { PageLayout } from "@/components/layout";
import { t } from "@/core/text";
import {
  buildSchedulePeriods,
  findEffectiveScheduleForRange,
  formatDate,
  formatDateTime,
  formatDayKey,
  formatDayLabel,
  getDayRangeByKey,
} from "@/hooks/slackingStatsUtils";
import { useSettingsStore } from "@/store/settingsStore";
import styles from "./status.styles";

function formatScheduleSummary(startTime: string, endTime: string, lunchStart?: string, lunchEnd?: string): string {
  const lunchText = lunchStart && lunchEnd ? `${lunchStart}-${lunchEnd}` : "-";
  return `Work ${startTime}-${endTime} / Lunch ${lunchText}`;
}

export default function StatusPage() {
  const { slackingRecords, scheduleHistory, schedule, language } = useSettingsStore();
  const text = t(language);

  const dateTabs = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() - index);

      return {
        key: formatDayKey(date),
        label: index === 0 ? text.status.today : formatDayLabel(formatDayKey(date), language),
      };
    });
  }, [language, text.status.today]);

  const [activeDayKey, setActiveDayKey] = useState<string>(dateTabs[0]?.key ?? "");

  const activeDaySwitchRecords = useMemo(() => {
    return slackingRecords.filter((record) => formatDayKey(new Date(record.timestamp)) === activeDayKey);
  }, [activeDayKey, slackingRecords]);

  const effectiveScheduleForActiveDay = useMemo(() => {
    const range = getDayRangeByKey(activeDayKey);
    if (!range) {
      return null;
    }
    const periods = buildSchedulePeriods(schedule, scheduleHistory);
    return findEffectiveScheduleForRange(periods, range);
  }, [activeDayKey, schedule, scheduleHistory]);

  return (
    <PageLayout title={text.status.title}>
      <View style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{text.status.historyTitle}</Text>
          <View style={styles.tabs}>
            {dateTabs.map((tab) => {
              const active = tab.key === activeDayKey;
              return (
                <Pressable key={tab.key} style={[styles.tab, active ? styles.tabActive : undefined]} onPress={() => setActiveDayKey(tab.key)}>
                  <Text style={[styles.tabText, active ? styles.tabTextActive : undefined]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.listContent}>
            {activeDaySwitchRecords.length === 0 ? (
              <Text style={styles.empty}>{text.status.noRecords}</Text>
            ) : (
              activeDaySwitchRecords.map((record) => (
                <View key={`${record.timestamp}-${record.switchState}`} style={styles.li}>
                  <Text style={styles.recordTime}>{formatDateTime(record.timestamp, language)}</Text>
                  <Text style={styles.tag}>{record.switchState === 1 ? text.status.switchOn : text.status.switchOff}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{text.status.settingsTitle}</Text>
          <View style={styles.listContent}>
            {!effectiveScheduleForActiveDay ? (
              <Text style={styles.empty}>{text.status.noRecords}</Text>
            ) : (
              <View style={styles.liCol}>
                <Text style={styles.liHead}>
                  {effectiveScheduleForActiveDay.isCurrent ? text.status.currentEffective : text.status.historicalEffective}
                </Text>
                <Text style={styles.summaryLine}>
                  {text.status.startDate}: {effectiveScheduleForActiveDay.startAt ? formatDate(effectiveScheduleForActiveDay.startAt, language) : text.status.notRecorded}
                </Text>
                <Text style={styles.summaryLine}>
                  {text.status.endDate}: {effectiveScheduleForActiveDay.isCurrent
                    ? "--"
                    : effectiveScheduleForActiveDay.endAt
                      ? formatDate(effectiveScheduleForActiveDay.endAt, language)
                      : "--"}
                </Text>
                <Text style={styles.summaryLine}>
                  {formatScheduleSummary(
                    effectiveScheduleForActiveDay.schedule.startTime,
                    effectiveScheduleForActiveDay.schedule.endTime,
                    effectiveScheduleForActiveDay.schedule.lunchStart,
                    effectiveScheduleForActiveDay.schedule.lunchEnd,
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
}

