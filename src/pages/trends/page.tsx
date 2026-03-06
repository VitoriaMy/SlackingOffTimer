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
          <div className={styles.chartItemTimeWrap}>
            <div className={styles.chartItemTime} style={{
              height: `${item.ratio}%`
            }}>
              <div className={styles.time}>{item.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className={styles.chartAxis}>
      {d7.map(item => (
        <div key={item.day} className={styles.chartItemDay}>{item.day}</div>
      ))}
    </div>
    <div className={styles.chartAxisNote}>日</div>
  </div>
}




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
        ratio: 74
      },
      {
        day: "19",
        time: "5h",
        ratio: 90
      },
      {
        day: "20",
        time: "2.4h",
        ratio: 42
      },
      {
        day: "21",
        time: "4.1h",
        ratio: 68
      },
      {
        day: "22",
        time: "3h",
        ratio: 55
      },
      {
        day: "23",
        time: "1.2h",
        ratio: 16
      },
    ]
  }, [])

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
        <Card label={i18n("total7")} value={'28.6h'} />
        <Card label={'日均摸鱼'} value={'5.2h'} />
      </div>
      <Chart title={'趋势图'} d7={data} />
    </Layout>
  );
}