import { useEffect, useMemo, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import { Layout } from "@/components/layout";
import { useSettingsStore } from "@/store";
import { useDaySwitchRecords } from "@/hooks/useDaySwitchRecords";
import { useEffectiveScheduleByDate } from "@/hooks/useEffectiveScheduleByDate";
import { usei18n } from "@/hooks/usei18n";

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

export default function StatusPage() {
  const i18n = usei18n();
  const { isLoading, reloadScheduleHistory, reloadSlackingRecords } = useSettingsStore();

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
        label: index === 0 ? i18n("today") : formatDayLabel(date),
      };
    });
  }, [i18n]);

  const [activeDayKey, setActiveDayKey] = useState(dateTabs[0]?.key ?? "");

  useEffect(() => {
    if (!dateTabs.some((tab) => tab.key === activeDayKey)) {
      setActiveDayKey(dateTabs[0]?.key ?? "");
    }
  }, [activeDayKey, dateTabs]);

  const { daySwitchRecords } = useDaySwitchRecords(activeDayKey);
  const { effectiveScheduleForDay } = useEffectiveScheduleByDate(activeDayKey);

  const lunchSummary = effectiveScheduleForDay?.schedule.lunchStart && effectiveScheduleForDay?.schedule.lunchEnd
    ? `${effectiveScheduleForDay.schedule.lunchStart}-${effectiveScheduleForDay.schedule.lunchEnd}`
    : i18n("noLunch");

  return (
    <Layout header={{ title: i18n("statusHistory") }}>
      <ScrollView>
        {isLoading ? <Text>{i18n("loading")}</Text> : null}

        <Text>{i18n("recent7DaySwitches")}</Text>
        <View>
          {dateTabs.map((tab) => (
            <Button
              key={tab.key}
              title={tab.key === activeDayKey ? `${tab.label} *` : tab.label}
              onPress={() => setActiveDayKey(tab.key)}
            />
          ))}
        </View>

        {daySwitchRecords.length === 0 ? (
          <Text>{i18n("noRecords")}</Text>
        ) : (
          daySwitchRecords.map((record) => (
            <Text key={`${record.timestamp}-${record.switchState}`}>
              {formatDateTime(record.timestamp)}
              {" "}
              {record.switchState === 1 ? i18n("startSession") : i18n("stopSession")}
            </Text>
          ))
        )}

        <Text>{effectiveScheduleForDay?.isCurrent ? i18n("currentSchedule") : i18n("historicalSchedule")}</Text>
        {!effectiveScheduleForDay ? (
          <Text>{i18n("noRecords")}</Text>
        ) : (
          <>
            <Text>{`${i18n("scheduleStartDate")}: ${effectiveScheduleForDay.startAt ? formatDate(effectiveScheduleForDay.startAt) : i18n("noRecords")}`}</Text>
            <Text>{`${i18n("scheduleEndDate")}: ${effectiveScheduleForDay.isCurrent ? "--" : effectiveScheduleForDay.endAt ? formatDate(effectiveScheduleForDay.endAt) : "--"}`}</Text>
            <Text>{`${i18n("workSummary")}: ${effectiveScheduleForDay.schedule.startTime}-${effectiveScheduleForDay.schedule.endTime}`}</Text>
            <Text>{`${i18n("lunchSummary")}: ${lunchSummary}`}</Text>
          </>
        )}
      </ScrollView>
    </Layout>
  );
}