import { StyleSheet } from "react-native";
import { rs } from "@/src/core/responsive";
import { theme } from "@/src/core/theme";

const styles = StyleSheet.create({
  switch: {
    width: rs(37),
    height: rs(20),
    justifyContent: "center",
  },
  line: {
    height: rs(1),
    backgroundColor: theme.colors.muted,
  },
  face: {
    position: "absolute",
    left: -rs(1),
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: theme.colors.muted,
  },
  faceChecked: {
    left: undefined,
    right: -rs(1),
    backgroundColor: theme.colors.primary,
  },
});

export default styles;
