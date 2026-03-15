import { useMemo, useState } from "react";
import {
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { BottonSwitch } from "@/components/BottonSwitch";
import styles from "./index.style";

const DEFAULT_DAYS = [
    { value: 1, label: "周一" },
    { value: 2, label: "周二" },
    { value: 3, label: "周三" },
    { value: 4, label: "周四" },
    { value: 5, label: "周五" },
    { value: 6, label: "周六" },
    { value: 0, label: "周日" },
];

interface WeekdaySelectorProps {
    value?: number[];
    defaultValue?: number[];
    onChange?: (next: number[]) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

function normalizeDays(days: number[]): number[] {
    return [...new Set(days)].filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
}

export function WeekdaySelector({
    value,
    defaultValue = [1, 2, 3, 4, 5],
    onChange,
    disabled,
    style,
}: WeekdaySelectorProps) {
    const [innerValue, setInnerValue] = useState<number[]>(normalizeDays(defaultValue));
    const selected = useMemo(() => normalizeDays(value ?? innerValue), [innerValue, value]);

    const toggleDay = (day: number) => {
        if (disabled) {
            return;
        }

        const exists = selected.includes(day);
        const next = exists
            ? selected.filter((item) => item !== day)
            : [...selected, day].sort((a, b) => a - b);

        if (value === undefined) {
            setInnerValue(next);
        }

        onChange?.(next);
    };

    return <View style={[styles.weekdaySelector, style]}>
        {DEFAULT_DAYS.map((item) => (
            <BottonSwitch
                key={item.value}
                checked={selected.includes(item.value)}
                label={item.label}
                onPress={() => toggleDay(item.value)}
                disabled={disabled}
            />
        ))}
    </View>
}