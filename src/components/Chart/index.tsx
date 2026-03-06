import styles from "./index.module.scss";

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
            <div key={item.day} className={styles.chartItem}>
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
          ))}
        </div>
        <div className={styles.chartAxis}>
          <div className={styles.unit}>日</div>
        </div>
      </div>
    </div>
  );
}
