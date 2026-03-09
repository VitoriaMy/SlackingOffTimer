import { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import styles from "./style.module.scss";
import { Modal } from "@/components/modal";

interface TimerProps {
    maxTime: string; // hh:mm
    minTime: string; // hh:mm
    value: string; // hh:mm
    onChange: (newValue: string) => void;
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

export function Timer({ maxTime, minTime, value, onChange, className }: TimerProps) {
    const ITEM_HEIGHT = 36;
    const VISIBLE_ROWS = 5;
    const SCROLL_END_DELAY = 180;
    const [open, setOpen] = useState(false);

    const range = useMemo(() => {
        const minMinutes = getSafeMinutes(minTime, 0);
        const maxMinutes = getSafeMinutes(maxTime, 23 * 60 + 59);

        const lower = Math.min(minMinutes, maxMinutes);
        const upper = Math.max(minMinutes, maxMinutes);

        return {
            lower,
            upper,
        };
    }, [maxTime, minTime]);

    const rawValue = getSafeMinutes(value, range.lower);
    const normalizedValue = clamp(rawValue, range.lower, range.upper);
    const [draftValue, setDraftValue] = useState(normalizedValue);
    const [draftHour, setDraftHour] = useState(Math.floor(normalizedValue / 60));
    const [draftMinute, setDraftMinute] = useState(normalizedValue % 60);
    const hourListRef = useRef<HTMLDivElement | null>(null);
    const minuteListRef = useRef<HTMLDivElement | null>(null);
    const hourScrollTimer = useRef<number | null>(null);
    const minuteScrollTimer = useRef<number | null>(null);
    const shouldAlignOnOpenRef = useRef(false);
    const isAligningOnOpenRef = useRef(false);
    const alignTimerRef = useRef<number | null>(null);

    const hourRange = useMemo(() => {
        const minHour = Math.floor(range.lower / 60);
        const maxHour = Math.floor(range.upper / 60);

        return {
            minHour,
            maxHour,
        };
    }, [range.lower, range.upper]);

    const hourOptions = useMemo(
        () => Array.from({ length: hourRange.maxHour - hourRange.minHour + 1 }, (_, index) => hourRange.minHour + index),
        [hourRange.maxHour, hourRange.minHour],
    );

    const getMinuteRange = (hour: number) => {
        const isLowerHour = hour === hourRange.minHour;
        const isUpperHour = hour === hourRange.maxHour;

        const minMinute = isLowerHour ? range.lower % 60 : 0;
        const maxMinute = isUpperHour ? range.upper % 60 : 59;

        return {
            minMinute,
            maxMinute,
        };
    };

    const minuteRange = useMemo(() => getMinuteRange(draftHour), [draftHour, hourRange.maxHour, hourRange.minHour, range.lower, range.upper]);

    const minuteOptions = useMemo(
        () => Array.from({ length: minuteRange.maxMinute - minuteRange.minMinute + 1 }, (_, index) => minuteRange.minMinute + index),
        [minuteRange.maxMinute, minuteRange.minMinute],
    );

    useEffect(() => {
        // Keep parent value in bounds when props change or value is out of range.
        if (normalizedValue !== rawValue || value !== formatHHMM(normalizedValue)) {
            onChange(formatHHMM(normalizedValue));
        }
    }, [normalizedValue, onChange, rawValue, value]);

    useEffect(() => {
        // Keep draft synced to controlled value while picker is closed.
        if (!open) {
            setDraftValue(normalizedValue);
        }
    }, [normalizedValue, open]);

    const openPicker = () => {
        setDraftValue(normalizedValue);
        setDraftHour(Math.floor(normalizedValue / 60));
        setDraftMinute(normalizedValue % 60);
        shouldAlignOnOpenRef.current = true;
        setOpen(true);
    };

    const closePicker = () => {
        setOpen(false);
    };

    const applyDraft = () => {
        onChange(formatHHMM(clamp(draftValue, range.lower, range.upper)));
        closePicker();
    };

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

    useEffect(() => {
        if (!open || !shouldAlignOnOpenRef.current) {
            return;
        }

        const alignToDraftValue = () => {
            const hourIndex = hourOptions.indexOf(draftHour);
            const minuteIndex = minuteOptions.indexOf(draftMinute);

            if (hourListRef.current && hourIndex >= 0) {
                hourListRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
            }

            if (minuteListRef.current && minuteIndex >= 0) {
                minuteListRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
            }
        };

        isAligningOnOpenRef.current = true;
        alignToDraftValue();
        alignTimerRef.current = window.setTimeout(() => {
            alignToDraftValue();
            isAligningOnOpenRef.current = false;
            alignTimerRef.current = null;
        }, 80);

        shouldAlignOnOpenRef.current = false;

        return () => {
            if (alignTimerRef.current !== null) {
                window.clearTimeout(alignTimerRef.current);
                alignTimerRef.current = null;
            }
            isAligningOnOpenRef.current = false;
        };
    }, [ITEM_HEIGHT, draftHour, draftMinute, hourOptions, minuteOptions, open]);

    useEffect(() => {
        if (!open || !minuteListRef.current) {
            return;
        }

        const minuteIndex = minuteOptions.indexOf(draftMinute);
        if (minuteIndex < 0) {
            return;
        }

        minuteListRef.current.scrollTo({
            top: minuteIndex * ITEM_HEIGHT,
            behavior: "smooth",
        });
    }, [ITEM_HEIGHT, draftMinute, minuteOptions, open]);

    useEffect(() => () => {
        if (alignTimerRef.current !== null) {
            window.clearTimeout(alignTimerRef.current);
        }

        if (hourScrollTimer.current !== null) {
            window.clearTimeout(hourScrollTimer.current);
        }

        if (minuteScrollTimer.current !== null) {
            window.clearTimeout(minuteScrollTimer.current);
        }
    }, []);

    const snapToNearest = (container: HTMLDivElement, options: number[], setValue: (value: number) => void) => {
        const index = clamp(Math.round(container.scrollTop / ITEM_HEIGHT), 0, options.length - 1);
        const nextValue = options[index];
        const targetTop = index * ITEM_HEIGHT;
        const needSnap = Math.abs(container.scrollTop - targetTop) > 0.5;

        if (needSnap) {
            container.scrollTo({ top: targetTop, behavior: "smooth" });
        }
        setValue(nextValue);
    };

    const scrollToOption = (
        container: HTMLDivElement | null,
        options: number[],
        selectedValue: number,
        setValue: (value: number) => void,
    ) => {
        if (!container) {
            return;
        }

        const index = options.indexOf(selectedValue);
        if (index < 0) {
            return;
        }

        container.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
        setValue(selectedValue);
    };

    const handleHourScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (isAligningOnOpenRef.current) {
            return;
        }

        const container = event.currentTarget;

        if (hourScrollTimer.current !== null) {
            window.clearTimeout(hourScrollTimer.current);
        }

        hourScrollTimer.current = window.setTimeout(() => {
            snapToNearest(container, hourOptions, setDraftHour);
        }, SCROLL_END_DELAY);
    };

    const handleMinuteScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (isAligningOnOpenRef.current) {
            return;
        }

        const container = event.currentTarget;

        if (minuteScrollTimer.current !== null) {
            window.clearTimeout(minuteScrollTimer.current);
        }

        minuteScrollTimer.current = window.setTimeout(() => {
            snapToNearest(container, minuteOptions, setDraftMinute);
        }, SCROLL_END_DELAY);
    };

    return <>
        <button type="button" className={classNames(styles.timer, className)} onClick={openPicker}>
            {formatHHMM(normalizedValue)}
        </button>

        {open && (
            <Modal
                onCancel={closePicker}
                onOk={applyDraft}
                okText="确认"
                cancelText="取消"
            >
                <div className={styles.panel}>
                    <div className={styles.preview}>{formatHHMM(draftValue)}</div>
                    <div
                        className={styles.pickers}
                        style={{
                            ["--item-height" as string]: `${ITEM_HEIGHT}px`,
                            ["--picker-height" as string]: `${ITEM_HEIGHT * VISIBLE_ROWS}px`,
                        }}
                    >
                        <div className={styles.pickerColumn}>
                            <div className={styles.pickerTitle}>时</div>
                            <div className={styles.pickerList} ref={hourListRef} onScroll={handleHourScroll}>
                                {hourOptions.map((hour) => (
                                    <div
                                        key={hour}
                                        className={classNames(styles.pickerItem, {
                                            [styles.active]: hour === draftHour,
                                        })}
                                        onClick={() => scrollToOption(hourListRef.current, hourOptions, hour, setDraftHour)}
                                    >
                                        {String(hour).padStart(2, "0")}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.pickerColumn}>
                            <div className={styles.pickerTitle}>分</div>
                            <div className={styles.pickerList} ref={minuteListRef} onScroll={handleMinuteScroll}>
                                {minuteOptions.map((minute) => (
                                    <div
                                        key={`${draftHour}-${minute}`}
                                        className={classNames(styles.pickerItem, {
                                            [styles.active]: minute === draftMinute,
                                        })}
                                        onClick={() => scrollToOption(minuteListRef.current, minuteOptions, minute, setDraftMinute)}
                                    >
                                        {String(minute).padStart(2, "0")}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.selectionFrame} aria-hidden="true" />
                    </div>
                    <div className={styles.hint}>
                        {formatHHMM(range.lower)} - {formatHHMM(range.upper)}
                    </div>
                </div>
            </Modal>
        )}
    </>;

}