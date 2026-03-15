import { Layout } from "@/components/layout";
import { Alert, Pressable, Text, View } from "react-native";
import { SettingRow } from "@/components/SettingRow";
import { MoodSwitch } from "@/components/MoodSwitch";
import { Timer } from "@/components/timer";
import { useState } from "react";
import { WeekdaySelector } from "@/components/WeekdaySelector";
import styles from "./_styles";

type WorkSchedule = {
  startTime: string;
  endTime: string;
  workDays: number[];
  lunchStart?: string;
  lunchEnd?: string;
};

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

function validateSchedule(schedule: WorkSchedule): string | null {
  if (toMinutes(schedule.startTime) > toMinutes(schedule.endTime)) {
    return "工作开始时间不能晚于结束时间";
  }

  if (schedule.workDays.length === 0) {
    return "请至少选择一个工作日";
  }

  if (schedule.lunchStart && schedule.lunchEnd) {
    const start = toMinutes(schedule.startTime);
    const end = toMinutes(schedule.endTime);
    const lunchStart = toMinutes(schedule.lunchStart);
    const lunchEnd = toMinutes(schedule.lunchEnd);

    if (lunchStart < start || lunchEnd > end || lunchStart > lunchEnd) {
      return "午休时间需落在工作时间内";
    }
  }

  return null;
}

export default function HomePage() {
  const [draft, setDraft] = useState<WorkSchedule>({
    startTime: "09:00",
    endTime: "18:00",
    workDays: [1, 2, 3, 4, 5],
    lunchStart: "12:00",
    lunchEnd: "13:00",
  });

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

  const handleSave = () => {
    const error = validateSchedule(draft);
    if (error) {
      Alert.alert("设置有误", error);
      return;
    }

    Alert.alert("保存成功", "设置已更新");
  };

  return (
    <Layout
      header={{
        title: "settings",
      }}
    >
      <SettingRow
        label="工作时间"
      >
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
        label="午休时间"
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
      <SettingRow label="工作日选择">
        <WeekdaySelector value={draft.workDays} onChange={(workDays) => setDraft((s) => ({ ...s, workDays }))} />
      </SettingRow>

      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存设置</Text>
        </Pressable>
      </View>
    </Layout>
  );
}
