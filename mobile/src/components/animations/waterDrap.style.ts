import { StyleSheet } from "react-native";
import { theme } from "@/core/theme";

export default StyleSheet.create({
  waterDropWrapper: {
    position: "absolute",
    top: "46%",
    bottom: "28%",
    left: "14%",
    width: "72%",
  },
  stage_1: {
    bottom: "22%",
  },
  stage_2: {
    bottom: "26.5%",
  },
  stage_3: {
    bottom: "31%",
  },
  stage_4: {
    bottom: "36%",
  },
  stage_5: {
    bottom: "41%",
  },
  stage_6: {
    display: "none",
  },

  waterDrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 20,
  },
  waterDropInner: {
    position: "absolute",
    top: 0,
    left: "24%",
    width: "50%",
    aspectRatio: 1,
    transformOrigin: "top center",
    overflow: "hidden",
  },
  waterDropAnimation: {
    position:"absolute",
    top: '0%',
    left: '50%',
    transformOrigin: "center",
    transform: [
      { translateX: '-50%' },
      { translateY: '-14%' },
    ],
    width: "220%",
    height: "40%",
  },
});
