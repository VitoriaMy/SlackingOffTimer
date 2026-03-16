import { StyleSheet } from "react-native";

export default StyleSheet.create({
  waterDropWrapper: {
    position: "absolute",
    top: "50%",
    bottom: "28%",
    left: "-2%",
    width: "100%",
  },
  stage_1: {
    bottom: "21%",
  },
  stage_2: {
    bottom: "26%",
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

  //   .waterDrop {
  //     position: absolute;
  //     top: 0%;
  //     left: 51%;
  //     transform: translateX(-50%);
  //     width: 0%;
  //     --width: 26%;
  //     color: var(--primary-color);
  //     &.step1 {
  //         width: var(--width);
  //         transition: width 2s ease-out;
  //     }
  //     &.step2 {
  //         width: var(--width);
  //         top: 100%;
  //         transition: top 1.4s linear;
  //     }
  //     &.step3 {
  //         width: var(--width);
  //         top: 100%;
  //     }
  // }

  waterDrop: {
    position: "absolute",
    top: 0,
    left: "51%",
    transform: [{ translateX: "-50%" }],
    width: 0,
    color: "var(--primary-color)",
  },
  step1: {
    width: 0,
  },
  step2: {
    width: "26%",
  },
  step3: {
    width: "26%",
    top: "100%",
  },
});
