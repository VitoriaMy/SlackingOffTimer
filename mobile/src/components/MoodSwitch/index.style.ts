import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

export default StyleSheet.create({
  switch: {
    width: rs(37),
    height: rs(20),
    position: "relative",
    justifyContent: "center",
  },
  lineIcon: {
    width: "100%",
    height: 1,
    borderRadius: 1,
    backgroundColor: theme.colors.font,
  },
  lineIconChecked: {
    backgroundColor: theme.colors.primary,
  },
  faceIconView: {
    position: "absolute",
    left: 0,
    top: 0,
    width: rs(20),
    height: rs(20),
    alignItems: "center",
    justifyContent: "center",
  },
  faceIcon: {
    width: rs(20),
    height: rs(20),
  },
});
