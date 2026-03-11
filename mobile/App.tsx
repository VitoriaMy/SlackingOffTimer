import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "@/App.styles";
import { isWorkWindow } from "@/src/core/time";
import { useCurrentSlackingDuration } from "@/src/hooks/useCurrentSlackingDuration";
import { useSlackRecord } from "@/src/hooks/useSlackRecord";
import { SettingsStoreProvider, useSettingsStore } from "@/src/store/settingsStore";

function HomeScreen() {
  const { loading, configured, schedule } = useSettingsStore();
  const { currentSwitchState, recordSlackSwitch } = useSlackRecord();
  const { durationText } = useCurrentSlackingDuration();

  const workNow = useMemo(() => isWorkWindow(new Date(), schedule), [schedule]);

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>SlackingOffTimer</Text>
        <Text style={styles.subtitle}>Loading local data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>SlackingOffTimer Mobile</Text>
      <Text style={styles.subtitle}>{configured ? "Configured" : "Not configured"}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Work window:</Text>
        <Text style={styles.value}>{workNow ? "In work time" : "Out of work time"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Today slacking:</Text>
        <Text style={styles.value}>{durationText}</Text>
      </View>

      <Pressable
        style={[styles.button, currentSwitchState === 1 ? styles.buttonActive : styles.buttonIdle]}
        onPress={() => {
          void recordSlackSwitch();
        }}
      >
        <Text style={styles.buttonText}>{currentSwitchState === 1 ? "Stop Slacking" : "Start Slacking"}</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  return (
    <SettingsStoreProvider>
      <SafeAreaView style={styles.container}>
        <HomeScreen />
        <StatusBar style="dark" />
      </SafeAreaView>
    </SettingsStoreProvider>
  );
}
