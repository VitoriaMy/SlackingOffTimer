import { useEffect, useMemo, useState } from "react";
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

    useEffect(() => {
        // Keep parent value in bounds when props change or value is out of range.
        if (normalizedValue !== rawValue || value !== formatHHMM(normalizedValue)) {
            onChange(formatHHMM(normalizedValue));
        }
    }, [normalizedValue, onChange, rawValue, value]);

    const openPicker = () => {
        setDraftValue(normalizedValue);
        setOpen(true);
    };

    const closePicker = () => {
        setOpen(false);
    };

    const applyDraft = () => {
        onChange(formatHHMM(clamp(draftValue, range.lower, range.upper)));
        closePicker();
    };

    const adjustDraft = (delta: number) => {
        setDraftValue((current) => clamp(current + delta, range.lower, range.upper));
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
                    <input
                        className={styles.range}
                        type="range"
                        min={range.lower}
                        max={range.upper}
                        value={draftValue}
                        onChange={(event) => setDraftValue(Number(event.target.value))}
                    />
                    <div className={styles.hint}>
                        {formatHHMM(range.lower)} - {formatHHMM(range.upper)}
                    </div>
                    <div className={styles.quickActions}>
                        <button type="button" className={styles.quickButton} onClick={() => adjustDraft(-1)}>-1 min</button>
                        <button type="button" className={styles.quickButton} onClick={() => adjustDraft(1)}>+1 min</button>
                    </div>
                </div>
            </Modal>
        )}
    </>;

}