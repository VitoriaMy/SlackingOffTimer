import { useEffect, useMemo, useRef, useState } from "react";
import {
	FlatList,
	Modal,
	Pressable,
	Text,
	View,
	type ListRenderItemInfo,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import { rs } from "@/core/responsive";
import styles from "./index.style";

interface TimerProps {
	maxTime: string;
	minTime: string;
	value: string;
	onChange: (newValue: string) => void;
	style?: StyleProp<ViewStyle>;
	className?: string;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function parseHHMM(input: string): number | null {
	const text = input.trim();
	const match = /^(\d{1,3}):(\d{2})$/.exec(text);

	if (!match) {
		return null;
	}

	const hour = Number(match[1]);
	const minute = Number(match[2]);

	if (!Number.isFinite(hour) || !Number.isFinite(minute) || minute < 0 || minute > 59) {
		return null;
	}

	return hour * 60 + minute;
}

function formatHHMM(totalMinutes: number) {
	if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
		return "00:00";
	}

	const safeMinutes = Math.round(totalMinutes);
	const hour = Math.floor(safeMinutes / 60);
	const minute = safeMinutes % 60;

	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getSafeMinutes(input: string, fallback: number) {
	const parsed = parseHHMM(input);
	if (parsed === null) {
		return fallback;
	}
	return parsed;
}

export function Timer({ maxTime, minTime, value, onChange, style }: TimerProps) {
	const ITEM_HEIGHT = rs(36);
	const VISIBLE_ROWS = 5;
	const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
	const PICKER_PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;
	const LOOP_REPEAT = 60;
	const LOOP_CENTER = Math.floor(LOOP_REPEAT / 2);
	const RECENTER_THRESHOLD_CYCLES = 8;
	const WHEEL_DECELERATION_RATE = 0.989;

	const [open, setOpen] = useState(false);

	const range = useMemo(() => {
		const minMinutes = getSafeMinutes(minTime, 0);
		const maxMinutes = getSafeMinutes(maxTime, 23 * 60 + 59);

		return {
			lower: Math.min(minMinutes, maxMinutes),
			upper: Math.max(minMinutes, maxMinutes),
		};
	}, [maxTime, minTime]);

	const rawValue = getSafeMinutes(value, range.lower);
	const normalizedValue = clamp(rawValue, range.lower, range.upper);
	const normalizedText = useMemo(() => formatHHMM(normalizedValue), [normalizedValue]);
	const [draftValue, setDraftValue] = useState(normalizedValue);
	const [draftHour, setDraftHour] = useState(Math.floor(normalizedValue / 60));
	const [draftMinute, setDraftMinute] = useState(normalizedValue % 60);
	const lastAutoNormalizedRef = useRef<string | null>(null);

	const hourListRef = useRef<FlatList<number> | null>(null);
	const minuteListRef = useRef<FlatList<number> | null>(null);

	const hourRange = useMemo(() => {
		const minHour = Math.floor(range.lower / 60);
		const maxHour = Math.floor(range.upper / 60);
		return { minHour, maxHour };
	}, [range.lower, range.upper]);

	const hourOptions = useMemo(
		() => Array.from({ length: hourRange.maxHour - hourRange.minHour + 1 }, (_, i) => hourRange.minHour + i),
		[hourRange.maxHour, hourRange.minHour]
	);
	const shouldLoopHours = hourOptions.length >= 5;
	const hourLoopOptions = useMemo(
		() => (shouldLoopHours ? Array.from({ length: LOOP_REPEAT }, () => hourOptions).flat() : hourOptions),
		[LOOP_REPEAT, hourOptions, shouldLoopHours]
	);

	const getMinuteRange = (hour: number) => {
		const isLowerHour = hour === hourRange.minHour;
		const isUpperHour = hour === hourRange.maxHour;

		return {
			minMinute: isLowerHour ? range.lower % 60 : 0,
			maxMinute: isUpperHour ? range.upper % 60 : 59,
		};
	};

	const minuteRange = useMemo(
		() => getMinuteRange(draftHour),
		[draftHour, hourRange.maxHour, hourRange.minHour, range.lower, range.upper]
	);

	const minuteOptions = useMemo(
		() => Array.from({ length: minuteRange.maxMinute - minuteRange.minMinute + 1 }, (_, i) => minuteRange.minMinute + i),
		[minuteRange.maxMinute, minuteRange.minMinute]
	);
	const shouldLoopMinutes = minuteOptions.length >= 5;
	const minuteLoopOptions = useMemo(
		() => (shouldLoopMinutes ? Array.from({ length: LOOP_REPEAT }, () => minuteOptions).flat() : minuteOptions),
		[LOOP_REPEAT, minuteOptions, shouldLoopMinutes]
	);

	useEffect(() => {
		if (value === normalizedText) {
			lastAutoNormalizedRef.current = normalizedText;
			return;
		}

		if (lastAutoNormalizedRef.current === normalizedText) {
			return;
		}

		lastAutoNormalizedRef.current = normalizedText;
		onChange(normalizedText);
	}, [normalizedText, onChange, value]);

	useEffect(() => {
		if (!open) {
			setDraftValue(normalizedValue);
		}
	}, [normalizedValue, open]);

	useEffect(() => {
		setDraftHour(Math.floor(draftValue / 60));
		setDraftMinute(draftValue % 60);
	}, [draftValue]);

	useEffect(() => {
		setDraftHour((current) => clamp(current, hourRange.minHour, hourRange.maxHour));
	}, [hourRange.maxHour, hourRange.minHour]);

	useEffect(() => {
		setDraftMinute((current) => clamp(current, minuteRange.minMinute, minuteRange.maxMinute));
	}, [minuteRange.maxMinute, minuteRange.minMinute]);

	useEffect(() => {
		setDraftValue(clamp(draftHour * 60 + draftMinute, range.lower, range.upper));
	}, [draftHour, draftMinute, range.lower, range.upper]);

	const openPicker = () => {
		setDraftValue(normalizedValue);
		setDraftHour(Math.floor(normalizedValue / 60));
		setDraftMinute(normalizedValue % 60);
		setOpen(true);
	};

	const closePicker = () => {
		setOpen(false);
	};

	const applyDraft = () => {
		onChange(formatHHMM(clamp(draftValue, range.lower, range.upper)));
		closePicker();
	};

	const snapToNearest = (
		offsetY: number,
		options: number[],
		baseLength: number,
		setValue: (nextValue: number) => void,
		centerCycle: number,
		recenterThresholdCycles: number,
		scroller?: FlatList<number> | null
	) => {
		if (baseLength <= 0) {
			return;
		}

		const index = clamp(Math.round(offsetY / ITEM_HEIGHT), 0, options.length - 1);
		const normalizedIndex = index % baseLength;
		const middleIndex = normalizedIndex + baseLength * centerCycle;
		const currentCycle = Math.floor(index / baseLength);
		const shouldRecenter = Math.abs(currentCycle - centerCycle) >= recenterThresholdCycles;
		const nextValue = options[normalizedIndex];
		setValue(nextValue);

		if (centerCycle > 0 && shouldRecenter) {
			scroller?.scrollToOffset({ offset: middleIndex * ITEM_HEIGHT, animated: false });
		}
	};

	const handleHourMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		snapToNearest(
			event.nativeEvent.contentOffset.y,
			hourLoopOptions,
			hourOptions.length,
			setDraftHour,
			shouldLoopHours ? LOOP_CENTER : 0,
			RECENTER_THRESHOLD_CYCLES,
			hourListRef.current
		);
	};

	const handleMinuteMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		snapToNearest(
			event.nativeEvent.contentOffset.y,
			minuteLoopOptions,
			minuteOptions.length,
			setDraftMinute,
			shouldLoopMinutes ? LOOP_CENTER : 0,
			RECENTER_THRESHOLD_CYCLES,
			minuteListRef.current
		);
	};

	const scrollToOption = (
		scroller: FlatList<number> | null,
		options: number[],
		baseLength: number,
		selectedValue: number,
		centerCycle: number,
		setValue: (nextValue: number) => void
	) => {
		if (baseLength <= 0) {
			return;
		}

		const index = options.indexOf(selectedValue);
		if (index < 0) {
			return;
		}

		const targetIndex = index + baseLength * centerCycle;
		scroller?.scrollToOffset({ offset: targetIndex * ITEM_HEIGHT, animated: true });
		setValue(selectedValue);
	};

	useEffect(() => {
		if (!open) {
			return;
		}

		const hourIndex = hourOptions.indexOf(draftHour);
		const minuteIndex = minuteOptions.indexOf(draftMinute);

		if (hourIndex >= 0) {
			hourListRef.current?.scrollToOffset({
				offset: (hourIndex + hourOptions.length * (shouldLoopHours ? LOOP_CENTER : 0)) * ITEM_HEIGHT,
				animated: false,
			});
		}

		if (minuteIndex >= 0) {
			minuteListRef.current?.scrollToOffset({
				offset: (minuteIndex + minuteOptions.length * (shouldLoopMinutes ? LOOP_CENTER : 0)) * ITEM_HEIGHT,
				animated: false,
			});
		}
	}, [ITEM_HEIGHT, LOOP_CENTER, draftHour, draftMinute, hourOptions, minuteOptions, open, shouldLoopHours, shouldLoopMinutes]);

	const renderHourItem = ({ item }: ListRenderItemInfo<number>) => (
		<Pressable
			style={styles.pickerItem}
			onPress={() =>
				scrollToOption(hourListRef.current, hourOptions, hourOptions.length, item, shouldLoopHours ? LOOP_CENTER : 0, setDraftHour)
			}
		>
			<Text style={[styles.pickerItemText, item === draftHour && styles.activeText]}>
				{String(item).padStart(2, "0")}
			</Text>
		</Pressable>
	);

	const renderMinuteItem = ({ item }: ListRenderItemInfo<number>) => (
		<Pressable
			style={styles.pickerItem}
			onPress={() =>
				scrollToOption(minuteListRef.current, minuteOptions, minuteOptions.length, item, shouldLoopMinutes ? LOOP_CENTER : 0, setDraftMinute)
			}
		>
			<Text style={[styles.pickerItemText, item === draftMinute && styles.activeText]}>
				{String(item).padStart(2, "0")}
			</Text>
		</Pressable>
	);

	return (
		<>
			<Pressable style={[styles.timer, style]} onPress={openPicker}>
				<Text style={styles.timerText}>{normalizedText}</Text>
			</Pressable>

			{open ? (
				<Modal transparent animationType="fade" visible onRequestClose={closePicker}>
					<Pressable style={styles.backdrop} onPress={closePicker}>
						<Pressable style={styles.modalCard} onPress={() => {}}>
							<View style={styles.panel}>
								<Text style={styles.preview}>{formatHHMM(draftValue)}</Text>
								<View style={styles.pickers}>
									<View style={styles.pickerColumn}>
										<Text style={styles.pickerTitle}>时</Text>
										<FlatList
											ref={hourListRef}
											style={styles.pickerList}
											data={hourLoopOptions}
											renderItem={renderHourItem}
											keyExtractor={(_, index) => `hour-${index}`}
											contentContainerStyle={{ paddingVertical: PICKER_PADDING }}
											getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
											initialNumToRender={VISIBLE_ROWS + 4}
											maxToRenderPerBatch={VISIBLE_ROWS + 8}
											windowSize={9}
											removeClippedSubviews
											snapToInterval={ITEM_HEIGHT}
											decelerationRate={WHEEL_DECELERATION_RATE}
											onMomentumScrollEnd={handleHourMomentumEnd}
											showsVerticalScrollIndicator={false}
										/>
									</View>

									<View style={styles.pickerColumn}>
										<Text style={styles.pickerTitle}>分</Text>
										<FlatList
											ref={minuteListRef}
											style={styles.pickerList}
											data={minuteLoopOptions}
											renderItem={renderMinuteItem}
											keyExtractor={(_, index) => `minute-${draftHour}-${index}`}
											contentContainerStyle={{ paddingVertical: PICKER_PADDING }}
											getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
											initialNumToRender={VISIBLE_ROWS + 4}
											maxToRenderPerBatch={VISIBLE_ROWS + 8}
											windowSize={9}
											removeClippedSubviews
											snapToInterval={ITEM_HEIGHT}
											decelerationRate={WHEEL_DECELERATION_RATE}
											onMomentumScrollEnd={handleMinuteMomentumEnd}
											showsVerticalScrollIndicator={false}
										/>
									</View>

									<View pointerEvents="none" style={styles.selectionFrame} />
								</View>
								<Text style={styles.hint}>
									{formatHHMM(range.lower)} - {formatHHMM(range.upper)}
								</Text>
							</View>
							<View style={styles.actions}>
								<Pressable style={styles.actionBtn} onPress={closePicker}>
									<Text style={styles.actionText}>取消</Text>
								</Pressable>
								<Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={applyDraft}>
									<Text style={[styles.actionText, styles.actionPrimaryText]}>确认</Text>
								</Pressable>
							</View>
						</Pressable>
					</Pressable>
				</Modal>
			) : null}
		</>
	);
}

