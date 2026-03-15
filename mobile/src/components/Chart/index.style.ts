import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

export default StyleSheet.create({
  chart: {
    height: rs(210),
    justifyContent: "space-between",
  },
  chartTitle: {
    height: rs(20),
    justifyContent: "center",
  },
  chartTitleText: {
    fontSize: rfs(14),
    color: theme.colors.font,
  },
  chartContent: {
    height: rs(170),
    justifyContent: "space-between",
  },
  chartBars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  chartItem: {
    width: rs(22),
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  chartItemBar: {
    width: rs(22),
    minHeight: rs(2),
    backgroundColor: theme.colors.primary,
    position: "relative",
  },
  time: {
    position: "absolute",
    left: "50%",
    bottom: "100%",
    transform: [{ translateX: '-50%' }, { translateY: -rs(8) }],
    width: rs(72),
    alignItems: "center",
  },
  timeText: {
    fontSize: rfs(12),
    lineHeight: rfs(16),
    color: theme.colors.primary,
  },
  day: {
    position: "absolute",
    left: "50%",
    top: "100%",
    transform: [{ translateX: '-50%' }, { translateY: rs(4) }],
    width: rs(40),
    alignItems: "center",
  },
  dayText: {
    fontSize: rfs(12),
    lineHeight: rfs(16),
    color: theme.colors.font,
  },
  chartAxis: {
    position: "relative",
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.primary,
  },
  unit: {
    position: "absolute",
    right: -rs(10),
    top: rs(4),
  },
  unitText: {
    fontSize: rfs(12),
    lineHeight: rfs(16),
    color: theme.colors.primary,
  },
});