import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import Constants from "expo-constants";
import LottieView from "lottie-react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { AnimationObject, LottieViewProps } from "lottie-react-native";

type ExpoGoLottieSource = string | AnimationObject | { uri: string };
type DotLottieSource = string | number | { uri: string };

type UniversalLottieProps = {
  source: ExpoGoLottieSource;
  dotLottieSource?: DotLottieSource;
  loop?: boolean;
  autoplay?: boolean;
  style?: StyleProp<ViewStyle>;
  onLoadError?: () => void;
};

const isExpoGo =
  Constants.executionEnvironment === "storeClient";

export function UniversalLottie({
  source,
  dotLottieSource,
  loop,
  autoplay,
  style,
  onLoadError,
}: UniversalLottieProps) {
  const nativeStyle = (style ?? {}) as ViewStyle;

  if (isExpoGo) {
    return (
      <LottieView
        source={source as LottieViewProps["source"]}
        loop={loop}
        autoPlay={autoplay}
        style={nativeStyle}
      />
    );
  }

  return (
    <DotLottie
      source={dotLottieSource ?? (source as unknown as DotLottieSource)}
      loop={loop}
      autoplay={autoplay}
      style={nativeStyle}
      onLoadError={onLoadError}
    />
  );
}