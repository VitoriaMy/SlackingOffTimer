import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
  button: {
    width: rs(36),
    height: rs(62),
    borderRadius: rs(10),
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: theme.colors.primary,
  },
  label: {
    fontSize: rfs(14),
    color: theme.colors.subtle,
    textAlign: "center",
    lineHeight: rfs(14),
  },
  char: {
    display: "flex",
  },
  labelChecked: {
    color: theme.colors.background,
    fontWeight: "600",
  },
});

export default styles;
