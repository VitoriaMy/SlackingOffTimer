import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
  row: {
    gap: rs(14),
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rs(12),
  },
  label: {
    fontSize: rfs(14),
    color: theme.colors.muted,
    fontWeight: "500",
  },
});

export default styles;
