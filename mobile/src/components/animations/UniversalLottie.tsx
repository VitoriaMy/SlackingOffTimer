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
  onAnimationFinish?: () => void;
};

const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

function isDotLottieFileSource(source: DotLottieSource | undefined): source is string {
  return typeof source === "string" && source.toLowerCase().endsWith(".lottie");
}

export function UniversalLottie({
  source,
  dotLottieSource,
  loop,
  autoplay,
  style,
  onLoadError,
  onAnimationFinish,
}: UniversalLottieProps) {
  const nativeStyle = (style ?? {}) as ViewStyle;
  const resolvedDotLottieSource = dotLottieSource ?? (source as unknown as DotLottieSource);
  const shouldUseDotLottie = !isExpoGo && isDotLottieFileSource(resolvedDotLottieSource);

  if (!shouldUseDotLottie) {
    return (
      <LottieView
        source={source as LottieViewProps["source"]}
        loop={loop}
        autoPlay={autoplay}
        style={nativeStyle}
        onAnimationFinish={onAnimationFinish}
      />
    );
  }

  return (
    <DotLottie
      source={resolvedDotLottieSource}
      loop={loop}
      autoplay={autoplay}
      style={nativeStyle}
      onLoadError={onLoadError}
    />
  );
}