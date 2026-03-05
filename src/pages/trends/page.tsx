import styles from "./page.module.scss";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Layout } from "@/components/layout";
import { usei18n } from "../../hooks/usei18n";
import { useMemo } from "react";

interface CardProps {
  label: string;
  value: string;
}

function Card({
  label,
  value,
}: CardProps) {
  return <div className={styles.card}>
    <div className={styles.label}>{label}</div>
    <div className={styles.value}>{value}</div>
  </div>
}


interface ChartProps {
  title: string;
  d7: {
    day: string;
    time: string;
    ratio: number;
  }[];
}


function Chart({
  title,
  d7,
}: ChartProps) {
  return <div className={styles.chart}>
    <div className={styles.chartTitle}>
      {title}
    </div>
    <div className={styles.chartContent}>
      {d7.map(item => (
        <div key={item.day} className={styles.chartItem}>
          <div className={styles.chartItemTime} style={{
            height: `${item.ratio}%`
          }}>
            <div className={styles.time}>{item.time}</div>
          </div>
          <div className={styles.chartItemDay}>{item.day}</div>
        </div>
      ))}
    </div>
  </div>
}




export function TrendsPage() {
  const i18n = usei18n();

  const data = useMemo(() => {
    return [
      {
        day: i18n("weekMon"),
        time: "1.2h",
        ratio: 23,
      },
      {
        day: i18n("weekTue"),
        time: "2.25h",
        ratio: 35
      },
      {
        day: i18n("weekWed"),
        time: "0.75h",
        ratio: 15
      },
      {
        day: i18n("weekThu"),
        time: "1.08h",
        ratio: 20
      },
      {
        day: i18n("weekFri"),
        time: "3.17h",
        ratio: 50
      },
      {
        day: i18n("weekSat"),
        time: "0.5h",
        ratio: 10
      },
      {
        day: i18n("weekSun"),
        time: "1.83h",
        ratio: 40
      },
    ]
  }, [i18n])

  return (
    <Layout
      header={{
        left: {
          children: <ArrowLeftOutlined />,
          to: "/",
        },
        title: i18n("trends")
      }}
    >
      <div className={styles.cards}>
        {/* 近7天总计 */}
        <Card label={i18n("total7")} value={'123.2h'} />
        {/* 日均摸鱼 */}
        <Card label={i18n("avgRatio")} value={'1.76h'} />
      </div>
      <Chart title={i18n("sevenDaysTitle")} d7={data} />
    </Layout>
  );
}