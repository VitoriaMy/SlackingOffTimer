import { View, Text, Button } from "react-native"
import styles from "./index.style"

export function StatusCard() {
    return <View style={styles.statusCard}>
        <View style={styles.time}>
            <Text style={styles.timeText}>12:23:34</Text>
        </View>
        <View style={styles.status}>
            <Text style={styles.statusText}>正在工作中</Text>
        </View>
        <View style={styles.triggerButton}>
            <Text style={styles.triggerButtonText}>开始工作</Text>
        </View>
    </View>
}