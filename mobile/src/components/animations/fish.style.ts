import { rs } from "@/core/responsive";
import { StyleSheet } from "react-native";

// .fish {
//   position: absolute;
//   bottom: 6%;
//   left: 50%;
//   transform: translateX(-50%);
//   width: 66%;
//   &.stage_1 {
//     display: none;
//   }
//   &.stage_2 {
//     bottom: 13%;
//     width: 32%;
//   }
//   &.stage_3 {
//     bottom: 14%;
//     width: 45%;
//   }
//   &.stage_4 {
//     bottom: 18%;
//     width: 48%;
//   }
//   &.stage_5 {
//     bottom: 20%;
//     width: 50%;
//   }
//   &.stage_6 {
//     bottom: 20%;
//     width: 54%;
//   }


export default StyleSheet.create({
    fish: {
        position: "absolute",
        bottom: "6%",
        left: "50%",
        height: rs(40),
        transform: [{ translateX: '-50%' }],
    },
    stage_1: {
        width: 0,
        height: 0,
    },
    stage_2: {
        width: '38%',
        height: rs(20),
        bottom: '16%',
    },
    stage_3: {
        width: '46%',
        height: rs(26),
        bottom: '18%',
    },
    stage_4: {
        width: '46%',
        height: rs(40),
        bottom: '20%',
    },
    stage_5: {
        width: '46%',
        height: rs(40),
        bottom: '24%',
    },
    stage_6: {
        width: '50%',
        height: rs(40),
        bottom: '26%',
    },
});