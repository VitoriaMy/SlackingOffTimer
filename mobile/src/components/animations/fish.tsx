import { UniversalLottie } from "./UniversalLottie";
import fishAnimation from "~/animations/fish.json";
import styles from "./fish.style";
import type { AnimationStage } from "./types";


export function FishAnimation({
    stage,
}: {
    stage: AnimationStage;
}) {
    return <UniversalLottie
        source={fishAnimation}
        dotLottieSource={require('~/animations/fish.json')}
        loop
        autoplay
        style={[
            styles.fish,
            styles[`stage_${stage}`],
        ]}
    />
}