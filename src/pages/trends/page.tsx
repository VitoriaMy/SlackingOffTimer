import styles from "./page.module.scss";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Layout } from "@/components/layout";
import { usei18n } from "../../hooks/usei18n";
import { useMemo } from "react";
import { Chart } from "@/components/Chart";
import { Card } from "@/components/Card";


export function TrendsPage() {
  const i18n = usei18n();

  const data = useMemo(() => {
    return [
      {
        day: "17",
        time: "4h",
        ratio: 58,
      },
      {
        day: "18",
        time: "4.5h",
        ratio: 74,
      },
      {
        day: "19",
        time: "5h",
        ratio: 90,
      },
      {
        day: "20",
        time: "2.4h",
        ratio: 42,
      },
      {
        day: "21",
        time: "4.1h",
        ratio: 68,
      },
      {
        day: "22",
        time: "3h",
        ratio: 55,
      },
      {
        day: "23",
        time: "1.2h",
        ratio: 16,
      },
    ];
  }, []);

  return (
    <Layout
      header={{
        left: {
          children: <ArrowLeftOutlined />,
          to: "/",
        },
        title: i18n("trends"),
      }}
    >
      <div className={styles.cards}>
        <Card label={i18n("total7")} value={"28.6h"} />
        <Card label={i18n("dailyAverage")} value={"5.2h"} />
      </div>
      <Chart title={i18n("trendChart")} d7={data} />
    </Layout>
  );
}
