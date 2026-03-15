import { memo, useMemo } from "react";
import { View, Text } from "react-native";
import styles from "./index.style";

type ChartItem = {
  day: string;
  time: string;
  ratio: number;
};

function clampRatio(ratio: number): number {
  return Math.max(0, Math.min(100, ratio));
}


/**
 *  展示对应天的工作时长占比柱状中的柱子
 * @param day -6 ~ 0 其中0代表今天，-1代表昨天，以此类推 
 * @returns 
 */
const ChartBar = memo(function ChartBar({ item }: { item: ChartItem }) {
  const barHeight = useMemo(() => ({ height: `${clampRatio(item.ratio)}%` as const }), [item.ratio]);

  return (
    <View style={styles.chartItem}>
      <View style={[styles.chartItemBar, barHeight]}>
        <View style={styles.time}>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.day}>
          <Text style={styles.dayText}>{item.day}</Text>
        </View>
      </View>
    </View>
  );
});


interface ChartProps {
  title: string;
  d7: ChartItem[];
}

export function Chart({ title, d7 }: ChartProps) {
  return (
    <View style={styles.chart}>
      <View style={styles.chartTitle}>
        <Text style={styles.chartTitleText}>{title}</Text>
      </View>
      <View style={styles.chartContent}>
        <View style={styles.chartBars}>
          {d7.map((item) => (
            <ChartBar key={item.day} item={item} />
          ))}
        </View>
        <View style={styles.chartAxis}>
          <View style={styles.unit}>
            <Text style={styles.unitText}>日</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
