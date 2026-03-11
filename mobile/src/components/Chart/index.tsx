import { Text, View } from "react-native";
import styles from "./index.styles";

type ChartItem = {
  day: string;
  time: string;
  ratio: number;
};

type TrendChartProps = {
  title: string;
  d7: ChartItem[];
};

export function TrendChart({ title, d7 }: TrendChartProps) {
  return (
    <View style={styles.chart}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barsWrap}>
        <View style={styles.bars}>
          {d7.map((item) => (
            <View style={styles.barItem} key={`${item.day}-${item.time}`}>
              <View style={[styles.bar, { height: `${item.ratio}%` }]}>
                <Text style={styles.time}>{item.time}</Text>
                <Text style={styles.day}>{item.day}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.axis}>
          <Text style={styles.unit}>日</Text>
        </View>
      </View>
    </View>
  );
}
