import { View } from "react-native";
import { MetricCard } from "@/src/components/Card";
import { TrendChart } from "@/src/components/Chart";
import { PageLayout } from "@/src/components/layout";
import { t } from "@/src/core/text";
import { useRecent7DaysSlackingStats } from "@/src/hooks/useRecent7DaysSlackingStats";
import { formatPercent } from "@/src/hooks/slackingStatsUtils";
import { useSettingsStore } from "@/src/store/settingsStore";
import styles from "./trends.styles";

export default function TrendsPage() {
  const { d7, totalDurationText, averageDurationText } = useRecent7DaysSlackingStats();
  const { language } = useSettingsStore();
  const text = t(language);
  const todayDuration = d7[d7.length - 1]?.durationMs ?? 0;
  const averageDuration = d7.length > 0 ? d7.reduce((sum, item) => sum + item.durationMs, 0) / d7.length : 0;
  const deltaRatio = averageDuration > 0 ? ((todayDuration - averageDuration) / averageDuration) * 100 : 0;
  const chartData = d7.map((item) => ({
    day: item.day,
    time: item.time,
    ratio: item.ratio,
  }));

  return (
    <PageLayout title={text.trends.title}>
      <View style={styles.container}>
        <View style={styles.cards}>
          <MetricCard label={text.trends.total} value={totalDurationText} />
          <MetricCard label={text.trends.average} value={averageDurationText} />
        </View>

        <View style={styles.card}>
          <View>
            <View>
              <TrendChart title={`${text.trends.todayVsAvg}: ${deltaRatio >= 0 ? "+" : ""}${formatPercent(Math.abs(deltaRatio), language)}`} d7={chartData} />
            </View>
          </View>
        </View>
      </View>
    </PageLayout>
  );
}

