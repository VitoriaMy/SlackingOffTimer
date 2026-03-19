import { Pressable, Text, View } from "react-native";
import styles from "./index.style";

interface StatusCardProps {
    durationText: string;
    statusText: string;
    actionText?: string;
    onPress?: () => void;
}

export function StatusCard({ durationText, statusText, actionText, onPress }: StatusCardProps) {
    return (
        <View style={styles.statusCard}>
            <View style={styles.time}>
                <Text style={styles.timeText}>{durationText}</Text>
            </View>
            <View style={styles.status}>
                <Text style={styles.statusText}>{statusText}</Text>
            </View>
            {actionText && onPress ? (
                <Pressable style={styles.triggerButton} onPress={onPress}>
                    <Text style={styles.triggerButtonText}>{actionText}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}