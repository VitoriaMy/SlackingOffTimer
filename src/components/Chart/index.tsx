import styles from "./index.module.scss";

/**
 *  展示对应天的工作时长占比柱状中的柱子
 * @param day -6 ~ 0 其中0代表今天，-1代表昨天，以此类推 
 * @returns 
 */ 
function ChartBar({ item }: {
  item: {
    day: string;
    time: string;
    ratio: number;
  };
}) {

  return <div className={styles.chartItem}>
    <div
      className={styles.chartItemTime}
      style={{
        height: `${item.ratio}%`,
      }}
    >
      <div className={styles.time}>{item.time}</div>
      <div className={styles.day}>{item.day}</div>
    </div>
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

export function Chart({ title, d7 }: ChartProps) {
  return (
    <div className={styles.chart}>
      <div className={styles.chartTitle}>{title}</div>
      <div className={styles.chartContent}>
        <div className={styles.chartBars}>
          {d7.map((item) => (
            <ChartBar key={item.day} item={item} />
          ))}
        </div>
        <div className={styles.chartAxis}>
          <div className={styles.unit}>日</div>
        </div>
      </div>
    </div>
  );
}
