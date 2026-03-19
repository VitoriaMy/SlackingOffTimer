import { Layout } from "@/components/layout";
import { Alert, Pressable, Text, View } from "react-native";
import { SettingRow } from "@/components/SettingRow";
import { MoodSwitch } from "@/components/MoodSwitch";
import { Timer } from "@/components/timer";
import { useEffect, useMemo, useState } from "react";
import { WeekdaySelector } from "@/components/WeekdaySelector";
import styles from "@/styles/settings";
import { useSettingsStore } from "@/store";
import { validateSchedule } from "@/schedule";
import { t } from "_/i18";
import { useRouter } from "expo-router";
import type { WorkSchedule } from "_/types";

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

function getLunchTimeText(schedule: WorkSchedule): string {
  if (!schedule.lunchStart || !schedule.lunchEnd) {
    return "-";
  }
  return `${schedule.lunchStart}-${schedule.lunchEnd}`;
}

export default function HomePage() {
  const router = useRouter();
  const {
    schedule,
    language,
    configured,
    isLoading,
    updateSchedule,
  } = useSettingsStore();
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<WorkSchedule>(schedule);

  useEffect(() => {
    if (!isLoading) {
      setDraft(schedule);
    }
  }, [isLoading, schedule]);

  const isScheduleDirty = useMemo(() => {
    return JSON.stringify(schedule) !== JSON.stringify(draft);
  }, [draft, schedule]);

  const isDirty = isScheduleDirty;

  const handleStartTimeChange = (nextStart: string) => {
    setDraft((current) => {
      const endTime = toMinutes(nextStart) > toMinutes(current.endTime) ? nextStart : current.endTime;
      const next: WorkSchedule = { ...current, startTime: nextStart, endTime };

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
      const next: WorkSchedule = { ...current, startTime, endTime: nextEnd };

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

      return { ...current, lunchStart, lunchEnd };
    });
  };

  const handleLunchEndChange = (nextLunchEnd: string) => {
    setDraft((current) => {
      if (!current.lunchStart || !current.lunchEnd) {
        return current;
      }

      const lunchEnd = clampTime(nextLunchEnd, current.startTime, current.endTime);
      const lunchStart = toMinutes(current.lunchStart) > toMinutes(lunchEnd) ? lunchEnd : current.lunchStart;

      return { ...current, lunchStart, lunchEnd };
    });
  };

  const toggleLunchBreak = () => {
    setDraft((current) => {
      if (current.lunchStart && current.lunchEnd) {
        return { ...current, lunchStart: undefined, lunchEnd: undefined };
      }

      return {
        ...current,
        lunchStart: current.lunchStart ?? fromMinutes(Math.max(toMinutes(current.startTime), 12 * 60)),
        lunchEnd: current.lunchEnd ?? fromMinutes(Math.min(toMinutes(current.endTime), 13 * 60)),
      };
    });
  };

  const handleSave = async () => {
    const text = t(language);

    if (configured && !isDirty) {
      router.replace("/");
      return;
    }

    const error = validateSchedule(draft, language);
    if (error) {
      Alert.alert(text.settingsErrorTitle, error);
      return;
    }

    try {
      setIsSaving(true);
      if (!configured || isScheduleDirty) {
        await updateSchedule(draft, true);
      }
      Alert.alert(text.saveSuccessTitle, text.saveSuccessMsg);
      router.replace("/");
    } catch {
      Alert.alert(text.saveFailTitle, text.saveFailMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout header={{ title: t(language).settings }}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>{t(language).settingsLoading}</Text>
        </View>
      </Layout>
    );
  }

  const text = t(language);

  return (
    <Layout header={{ title: text.settings, showLeft: configured }}>
      <SettingRow label={text.sectionWorkTime}>
        <View style={styles.timeRange}>
          <Timer
            style={styles.timeValue}
            value={draft.startTime}
            minTime="00:00"
            maxTime={draft.endTime}
            onChange={handleStartTimeChange}
          />
          <Timer
            style={styles.timeValue}
            value={draft.endTime}
            minTime={draft.startTime}
            maxTime="23:59"
            onChange={handleEndTimeChange}
          />
        </View>
      </SettingRow>
      <SettingRow
        label={text.sectionLunchTime}
        more={<MoodSwitch checked={Boolean(draft.lunchStart && draft.lunchEnd)} onPress={toggleLunchBreak} />}
      >
        <View style={styles.timeRange}>
          {draft.lunchStart && draft.lunchEnd ? (
            <Timer
              style={styles.timeValue}
              value={draft.lunchStart}
              minTime={draft.startTime}
              maxTime={draft.lunchEnd}
              onChange={handleLunchStartChange}
            />
          ) : (
            <View style={styles.timeValueStatic}>
              <Text style={styles.timeValueStaticText}>{getLunchTimeText(draft)}</Text>
            </View>
          )}
          {draft.lunchStart && draft.lunchEnd ? (
            <Timer
              style={styles.timeValue}
              value={draft.lunchEnd}
              minTime={draft.lunchStart}
              maxTime={draft.endTime}
              onChange={handleLunchEndChange}
            />
          ) : (
            <View style={styles.timeValueStatic}>
              <Text style={styles.timeValueStaticText}>{getLunchTimeText(draft)}</Text>
            </View>
          )}
        </View>
      </SettingRow>
      <SettingRow label={text.sectionWorkDays}>
        <WeekdaySelector value={draft.workDays} onChange={(workDays) => setDraft((s) => ({ ...s, workDays }))} />
      </SettingRow>

      <View style={styles.footer}>
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{isSaving ? text.savingSettings : text.saveSettings}</Text>
          </Pressable>
        </View>
        <Text style={styles.hintText}>{text.settingsCacheHint}</Text>
      </View>
      <View style={styles.bottomSpacer}>
        <Text style={styles.bottomSpacerText}> </Text>
      </View>
    </Layout>
  );
}
