import { StyleSheet } from "react-native";
import { rs } from "@/core/responsive";

export default StyleSheet.create({
  container: {
    marginHorizontal: 'auto',
    width: rs(216),
    height: rs(384),
    aspectRatio: 216 / 384,
    position: "relative",
    overflow: "hidden",
  },
});
