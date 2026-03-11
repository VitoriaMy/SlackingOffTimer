import { StyleProp, View, ViewStyle } from "react-native";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import styles from "./Water.styles";

const STAGE_OPACITY: Record<number, number> = {
  1: 0.45,
  2: 0.7,
  3: 1,
};

type WaterAnimationProps = {
  style?: StyleProp<ViewStyle>;
  stage?: number;
};

export function WaterAnimation({ style, stage = 3 }: WaterAnimationProps) {
  const opacity = STAGE_OPACITY[stage] ?? 1;

  return (
    <View style={[styles.container, style, { opacity }]}>
      <DotLottie
        source={require("../../../assets/animations/water.json")}
        autoplay
        loop
        style={styles.animation}
      />
    </View>
  );
}
