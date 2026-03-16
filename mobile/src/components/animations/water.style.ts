import { StyleSheet } from "react-native";
import { rs } from "@/core/responsive";

export default StyleSheet.create({
  water: {
    position: "relative",
    overflow: "hidden",
    width: rs(240),
    height: rs(400),
  },

  watterAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "600%",
  },
  stage_1: {
    top: 0,
  },
  stage_2: {
    top: "-100%",
  },
  stage_3: {
    top: "-200%",
  },
  stage_4: {
    top: "-300%",
  },
  stage_5: {
    top: "-400%",
  },
  stage_6: {
    top: "-500%",
  },
});
