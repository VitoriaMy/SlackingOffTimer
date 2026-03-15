import { memo, useMemo } from "react";
import {
    Pressable,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import styles from "./index.style";

interface BottonSwitchProps {
    checked: boolean;
    label: string;
    onClick?: () => void;
    onPress?: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const BottonSwitch = memo(function BottonSwitch({
    checked,
    label,
    onClick,
    onPress,
    disabled,
    style,
}: BottonSwitchProps) {
    const chars = useMemo(() => label.split(""), [label]);

    return (
        <Pressable
            onPress={onPress ?? onClick}
            disabled={disabled}
            style={[styles.bottonSwitch, checked && styles.checked, style]}
        >
            <View style={styles.labelWrap}>
                {chars.map((char, index) => (
                    <Text key={`${char}-${index}`} style={[styles.labelText, checked && styles.checkedText]}>
                        {char}
                    </Text>
                ))}
            </View>
        </Pressable>
    );
});