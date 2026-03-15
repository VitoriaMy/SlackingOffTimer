import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

export default StyleSheet.create({
  bottonSwitch: {
    width: rs(36),
    height: rs(62),
    borderRadius: rs(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.defaultBg,
  },
  checked: {
    backgroundColor: theme.colors.primary,
  },
  labelWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: rs(1),
  },
  labelText: {
    fontSize: rfs(14),
    lineHeight: rfs(16),
    color: theme.colors.primary,
    fontWeight: "600",
  },
  checkedText: {
    color: theme.colors.white,
  },
});
