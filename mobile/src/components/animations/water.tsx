import type { StyleProp, ViewStyle } from "react-native";
import waterAnimation from "~/animations/water.json";
import { UniversalLottie } from "./UniversalLottie";
import type { AnimationStage } from "./types";
import { View } from "react-native";
import styles from "./water.style";

export function WaterAnimation({
  isRunning = true,
  stage,
}: {
  style?: StyleProp<ViewStyle>;
  isRunning?: boolean;
  stage: AnimationStage;
}) {
  return (
    <View style={styles.water}>
      <UniversalLottie
        style={[styles.watterAnimation, styles[`stage_${stage}`]]}
        source={waterAnimation}
        dotLottieSource={require("~/animations/water.json")}
        loop={isRunning}
        autoplay={isRunning}
        onLoadError={() => {
          console.warn("Water animation failed to load");
        }}
      />
    </View>
  );
}
