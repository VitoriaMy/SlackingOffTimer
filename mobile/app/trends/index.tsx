import { Layout } from "@/components/layout";
import { Text, View } from "react-native";
import styles from "@/styles/trends";
import { Card } from "@/components/Card";
import { Chart } from "@/components/Chart";
import { useRecent7DaysSlackingStats } from "@/hooks/useRecent7DaysSlackingStats";
import { usei18n } from "@/hooks/usei18n";
import { useSettingsStore } from "@/store";


export default function HomePage() {
  const i18n = usei18n();
  const { isLoading } = useSettingsStore();
  const { d7, totalDurationText, averageDurationText } = useRecent7DaysSlackingStats();
  const hasData = d7.some((item) => item.durationMs > 0);

  return (
    <Layout
      header={{
        title: i18n("trends"),
      }}
    >
      <View style={styles.cards}>
        <Card label={i18n("total7")} value={totalDurationText} />
        <Card label={i18n("dailyAverage")} value={averageDurationText} />
      </View>
      {isLoading ? <Text>{i18n("loading")}</Text> : null}
      {!isLoading && !hasData ? <Text>{i18n("noDataHint")}</Text> : null}
      <Chart
        title={i18n("trendChart")}
        d7={d7}
      />
    </Layout>
  );
}

