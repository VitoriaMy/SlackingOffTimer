import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageLayout } from "@/src/components/layout";
import { WaterAnimation } from "@/src/components/animations/Water";
import { t } from "@/src/core/text";
import { rfs, rs } from "@/src/core/responsive";
import { theme } from "@/src/core/theme";
import { isWorkWindow } from "@/src/core/time";
import { useCurrentSlackingDuration } from "@/src/hooks/useCurrentSlackingDuration";
import { useSlackRecord } from "@/src/hooks/useSlackRecord";
import { useSettingsStore } from "@/src/store/settingsStore";
import styles from "./index.styles";

export default function HomePage() {
  const router = useRouter();
  const { loading, configured, schedule, language } = useSettingsStore();
  const { currentSwitchState, recordSlackSwitch } = useSlackRecord();
  const { durationText } = useCurrentSlackingDuration();
  const text = t(language);

  const workNow = useMemo(() => isWorkWindow(new Date(), schedule), [schedule]);

  useEffect(() => {
    if (!loading && !configured) {
      router.replace("/(tabs)/settings");
    }
  }, [configured, loading, router]);

  if (loading) {
    return (
      <PageLayout>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingTitle}>{text.home.title}</Text>
          <Text style={styles.loadingSub}>{text.home.loadingData}</Text>
        </View>
      </PageLayout>
    );
  }

  if (!configured) {
    return (
      <PageLayout>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingTitle}>{text.home.title}</Text>
          <Text style={styles.loadingSub}>{text.home.redirectingToSettings}</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={{
        onPress: () => router.push("/(tabs)/trends"),
        children: <Ionicons name="stats-chart" size={rfs(20)} color={theme.colors.primary} />,
      }}
      rightAction={{
        onPress: () => router.push("/(tabs)/settings"),
        children: <Ionicons name="settings" size={rfs(20)} color={theme.colors.primary} />,
      }}
      showBack={false}
    >
      <View style={styles.page}>
        <WaterAnimation style={styles.water} stage={Math.max(1, Math.min(3, currentSwitchState === 1 ? 3 : 1))} />

        <View style={styles.statusCard}>
          <Text style={styles.durationHero}>{durationText}</Text>
          <Text style={styles.statusText}>{workNow ? text.home.inWorkTime : text.home.outWorkTime}</Text>

          <View style={styles.quickActions}>
            <Pressable style={styles.quickButton} onPress={() => router.push("/(tabs)/status")}> 
              <Ionicons name="pulse" size={rfs(16)} color={theme.colors.primary} />
              <Text style={styles.quickButtonText}>{text.tabs.status}</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.button}
            onPress={() => {
              void recordSlackSwitch();
            }}
          >
            <Text style={styles.buttonText}>
              {currentSwitchState === 1 ? text.home.stopSlacking : text.home.startSlacking}
            </Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style="dark" />
    </PageLayout>
  );
}

