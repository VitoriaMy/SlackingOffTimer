import { StyleSheet } from "react-native";
import { rfs, rs } from "@/src/core/responsive";
import { theme } from "@/src/core/theme";

const styles = StyleSheet.create({
  chart: {
    height: rs(210),
    justifyContent: "space-between",
  },
  title: {
    height: rs(20),
    fontSize: rfs(14),
    color: theme.colors.subtle,
  },
  barsWrap: {
    height: rs(170),
  },
  bars: {
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  barItem: {
    width: rs(22),
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: rs(22),
    backgroundColor: theme.colors.primary,
    position: "relative",
    minHeight: rs(2),
  },
  time: {
    position: "absolute",
    bottom: "100%",
    marginBottom: rs(12),
    left: "50%",
    transform: [{ translateX: -rs(18) }],
    width: rs(36),
    textAlign: "center",
    fontSize: rfs(10),
    color: theme.colors.primary,
  },
  day: {
    position: "absolute",
    top: "100%",
    marginTop: rs(6),
    left: "50%",
    transform: [{ translateX: -rs(14) }],
    width: rs(28),
    textAlign: "center",
    fontSize: rfs(12),
    color: theme.colors.subtle,
  },
  axis: {
    marginTop: rs(1),
    height: rs(1),
    backgroundColor: theme.colors.primary,
  },
  unit: {
    position: "absolute",
    right: -rs(12),
    top: rs(5),
    fontSize: rfs(12),
    color: theme.colors.subtle,
  },
});

export default styles;
