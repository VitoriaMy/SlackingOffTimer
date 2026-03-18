import { StyleSheet } from "react-native";
import { rs } from "@/core/responsive";

export default StyleSheet.create({
  container: {
    marginHorizontal: 'auto',
    width: rs(240),
    height: rs(400),
    aspectRatio: 240 / 400,
    position: "relative",
    overflow: "hidden",
  },
});
