import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: rs(110),
    backgroundColor: theme.colors.background,
    borderRadius: rs(20),
    paddingHorizontal: rs(16),
    paddingVertical: rs(18),
    justifyContent: "space-between",
  },
  label: {
    fontSize: rfs(14),
    color: theme.colors.subtle,
  },
  value: {
    fontSize: rfs(24),
    color: theme.colors.primary,
    fontWeight: "700",
  },
});

export default styles;
