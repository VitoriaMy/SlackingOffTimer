import styles from "./page.module.scss";
import { Layout } from "@/components/layout";
import { usei18n } from "../../hooks/usei18n";
import { Chart } from "@/components/Chart";
import { Card } from "@/components/Card";
import { useRecent7DaysSlackingStats } from "@/hooks/useRecent7DaysSlackingStats";


export function TrendsPage() {
  const i18n = usei18n();
  const { d7, totalDurationText, averageDurationText } = useRecent7DaysSlackingStats();

  return (
    <Layout
      header={{
        title: i18n("trends"),
      }}
    >
      <div className={styles.cards}>
        <Card label={i18n("total7")} value={totalDurationText} />
        <Card label={i18n("dailyAverage")} value={averageDurationText} />
      </div>
      <Chart title={i18n("trendChart")} d7={d7} />
    </Layout>
  );
}
