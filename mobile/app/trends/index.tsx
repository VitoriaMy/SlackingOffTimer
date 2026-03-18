import { Layout } from "@/components/layout";
import { View } from "react-native";
import styles from "@/styles/trends";
import { Card } from "@/components/Card";
import { Chart } from "@/components/Chart";
// 当前运行环境变量是开发环境还是生产环境


export default function HomePage() {

  const d7 = [
    { day: "6天前", time: "12h20m", ratio: 20 },
    { day: "5天前", time: "21h10m", ratio: 35 },
    { day: "4天前", time: "11h50m", ratio: 30 },
    { day: "3天前", time: "13h15m", ratio: 50 },
    { day: "2天前", time: "12h45m", ratio: 40 },
    { day: "昨天", time: "11h30m", ratio: 25 },
    { day: "今天", time: "12h30m", ratio: 45 },
  ];

  return (
    <Layout
      header={{
        title: "trends",
      }}
    >
      <View style={styles.cards}>
        <Card label="今日专注时长" value="2h 30m" />
        <Card label="本周专注时长" value="12h 45m" />
      </View>
      <Chart
        title="最近7天专注时长占比"
        d7={d7}
      />
    </Layout>
  );
}

