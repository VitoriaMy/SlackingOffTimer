import { useEffect, useMemo, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Platform, Pressable, Text, View } from "react-native";
import { MoodSwitch } from "@/src/components/MoodSwitch";
import { SettingRow } from "@/src/components/SettingRow";
import { PageLayout } from "@/src/components/layout";
import { validateSchedule } from "@/src/core/schedule";
import { t } from "@/src/core/text";
import { WorkSchedule } from "@/src/core/types";
import { useSettingsStore } from "@/src/store/settingsStore";
import styles from "./settings.styles";

const WEEKDAY_OPTIONS = [1, 2, 3, 4, 5, 6, 0] as const;

const isValidTime = (value: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const fromMinutes = (total: number): string => {
  const safe = Math.max(0, Math.min(total, 23 * 60 + 59));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const clampTime = (value: string, min: string, max: string): string => {
  const minutes = toMinutes(value);
  const minMinutes = toMinutes(min);
  const maxMinutes = toMinutes(max);
  if (minutes < minMinutes) return min;
  if (minutes > maxMinutes) return max;
  return value;
};

export default function SettingsPage() {
  const { language, schedule, updateSchedule } = useSettingsStore();
  const [draft, setDraft] = useState<WorkSchedule>(schedule);
  const [errorText, setErrorText] = useState<string>("");
  const [successText, setSuccessText] = useState<string>("");
  const [pickerField, setPickerField] = useState<"startTime" | "endTime" | "lunchStart" | "lunchEnd" | null>(null);
  const [iosPendingDate, setIosPendingDate] = useState<Date>(new Date());
  const text = t(language);

  useEffect(() => {
    setDraft(schedule);
  }, [schedule]);

  const canSave = useMemo(() => {
    return (
      isValidTime(draft.startTime) &&
      isValidTime(draft.endTime) &&
      (!draft.lunchStart || isValidTime(draft.lunchStart)) &&
      (!draft.lunchEnd || isValidTime(draft.lunchEnd))
    );
  }, [draft.endTime, draft.lunchEnd, draft.lunchStart, draft.startTime]);

  const toggleWorkDay = (value: number) => {
    const selected = draft.workDays.includes(value)
      ? draft.workDays.filter((item) => item !== value)
      : [...draft.workDays, value].sort((a, b) => a - b);
    setDraft((current) => ({ ...current, workDays: selected }));
    setSuccessText("");
  };

  const hasLunchBreak = Boolean(draft.lunchStart && draft.lunchEnd);

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

  const saveDraft = async () => {
    setErrorText("");
    setSuccessText("");

    if (!canSave) {
      setErrorText(text.settings.timeFormat);
      return;
    }

    const normalizedDraft: WorkSchedule = {
      ...draft,
      lunchStart: draft.lunchStart?.trim() || undefined,
      lunchEnd: draft.lunchEnd?.trim() || undefined,
    };

    const validationError = validateSchedule(normalizedDraft, language);
    if (validationError) {
      setErrorText(validationError);
      return;
    }

    await updateSchedule(normalizedDraft, true);
    setSuccessText(text.settings.saved);
  };

  const parseTimeToDate = (time: string | undefined, fallback = "09:00"): Date => {
    const value = time && /^([01]\d|2[0-3]):([0-5]\d)$/.test(time) ? time : fallback;
    const [hour, minute] = value.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const formatDateToTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const onTimePicked = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type !== "set" || !selectedDate || !pickerField) {
      if (Platform.OS === "android") {
        setPickerField(null);
      }
      return;
    }

    if (Platform.OS === "ios") {
      setIosPendingDate(selectedDate);
      return;
    }

    const next = formatDateToTime(selectedDate);
    if (pickerField === "startTime") handleStartTimeChange(next);
    else if (pickerField === "endTime") handleEndTimeChange(next);
    else if (pickerField === "lunchStart") handleLunchStartChange(next);
    else if (pickerField === "lunchEnd") handleLunchEndChange(next);
    setSuccessText("");
    setPickerField(null);
  };

  const openPicker = (field: "startTime" | "endTime" | "lunchStart" | "lunchEnd") => {
    setPickerField(field);
    setIosPendingDate(parseTimeToDate(draft[field]));
  };

  const applyIosPicker = () => {
    if (!pickerField) {
      return;
    }
    const next = formatDateToTime(iosPendingDate);
    if (pickerField === "startTime") handleStartTimeChange(next);
    else if (pickerField === "endTime") handleEndTimeChange(next);
    else if (pickerField === "lunchStart") handleLunchStartChange(next);
    else if (pickerField === "lunchEnd") handleLunchEndChange(next);
    setSuccessText("");
    setPickerField(null);
  };

  const weekdayLabel = (value: (typeof WEEKDAY_OPTIONS)[number]) => {
    if (language === "zh") {
      const zhMap: Record<number, string> = {
        1: "周一",
        2: "周二",
        3: "周三",
        4: "周四",
        5: "周五",
        6: "周六",
        0: "周日",
      };
      return zhMap[value];
    }

    const enMap: Record<number, string> = {
      1: "Mon",
      2: "Tue",
      3: "Wed",
      4: "Thu",
      5: "Fri",
      6: "Sat",
      0: "Sun",
    };
    return enMap[value];
  };

  return (
    <PageLayout title={text.settings.title}>
      <View style={styles.scrollContent}>
        <View style={styles.card}>
          <SettingRow label={text.settings.sectionWorkTime}>
            <View style={styles.timeRange}>
              <View style={styles.timeCol}>
                <Text style={styles.label}>{text.settings.workStart}</Text>
                <Pressable style={styles.timeButton} onPress={() => openPicker("startTime")}>
                  <Text style={styles.timeButtonText}>{draft.startTime}</Text>
                </Pressable>
              </View>
              <View style={styles.timeCol}>
                <Text style={styles.label}>{text.settings.workEnd}</Text>
                <Pressable style={styles.timeButton} onPress={() => openPicker("endTime")}>
                  <Text style={styles.timeButtonText}>{draft.endTime}</Text>
                </Pressable>
              </View>
            </View>
          </SettingRow>

          <SettingRow
            label={text.settings.enableLunchBreak}
            more={<MoodSwitch checked={hasLunchBreak} onPress={toggleLunchBreak} />}
          >
            <View style={styles.timeRange}>
              <View style={styles.timeCol}>
                <Text style={styles.label}>{text.settings.lunchStart}</Text>
                <View style={styles.timeRow}>
                  <Pressable style={[styles.timeButton, !hasLunchBreak ? styles.timeButtonDisabled : undefined]} onPress={() => openPicker("lunchStart")} disabled={!hasLunchBreak}>
                    <Text style={styles.timeButtonText}>{draft.lunchStart ?? text.settings.notSet}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.clearButton}
                    onPress={() => setDraft((current) => ({ ...current, lunchStart: undefined }))}
                    disabled={!hasLunchBreak}
                  >
                    <Text style={styles.clearButtonText}>{text.common.clear}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.timeCol}>
                <Text style={styles.label}>{text.settings.lunchEnd}</Text>
                <View style={styles.timeRow}>
                  <Pressable style={[styles.timeButton, !hasLunchBreak ? styles.timeButtonDisabled : undefined]} onPress={() => openPicker("lunchEnd")} disabled={!hasLunchBreak}>
                    <Text style={styles.timeButtonText}>{draft.lunchEnd ?? text.settings.notSet}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.clearButton}
                    onPress={() => setDraft((current) => ({ ...current, lunchEnd: undefined }))}
                    disabled={!hasLunchBreak}
                  >
                    <Text style={styles.clearButtonText}>{text.common.clear}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </SettingRow>

          {pickerField ? (
            <View style={styles.pickerCard}>
              <DateTimePicker
                value={Platform.OS === "ios" ? iosPendingDate : parseTimeToDate(draft[pickerField])}
                mode="time"
                is24Hour
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimePicked}
              />
              {Platform.OS === "ios" ? (
                <View style={styles.pickerActions}>
                  <Pressable style={styles.pickerCancel} onPress={() => setPickerField(null)}>
                    <Text style={styles.pickerActionText}>{text.common.cancel}</Text>
                  </Pressable>
                  <Pressable style={styles.pickerConfirm} onPress={applyIosPicker}>
                    <Text style={styles.pickerActionText}>{text.common.confirm}</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}

          <SettingRow label={text.settings.sectionWorkDays}>
            <View style={styles.dayRow}>
              {WEEKDAY_OPTIONS.map((dayValue) => {
                const selected = draft.workDays.includes(dayValue);
                return (
                  <Pressable key={dayValue} style={[styles.dayPill, selected ? styles.dayPillSelected : undefined]} onPress={() => toggleWorkDay(dayValue)}>
                    <Text style={[styles.dayText, selected ? styles.dayTextSelected : undefined]}>{weekdayLabel(dayValue)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </SettingRow>

          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
          {successText ? <Text style={styles.success}>{successText}</Text> : null}

          <View style={styles.footer}>
            <Pressable
              style={styles.button}
              onPress={() => {
                void saveDraft();
              }}
            >
              <Text style={styles.buttonText}>{text.settings.saveSchedule}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </PageLayout>
  );
}

