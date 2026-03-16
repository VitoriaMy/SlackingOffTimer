import { UniversalLottie } from "./UniversalLottie";
import fishAnimation from "~/animations/fish.json";
import type { StyleProp, ViewStyle } from "react-native";


export function FishAnimation({
    style
}: {
    style?: StyleProp<ViewStyle>;
}) {
    return <UniversalLottie
        source={fishAnimation}
        dotLottieSource={require('~/animations/fish.json')}
        loop
        autoplay
        style={style}
    />
}