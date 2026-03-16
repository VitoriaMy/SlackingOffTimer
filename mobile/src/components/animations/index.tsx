import { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { FishAnimation } from "./fish";
import { WaterDrapAnimation } from "./waterDrap";
import { WaterAnimation } from "./water";
import styles, { animationStageStyles } from "./index.style";

export function Animations({
    isRunning = true,
    progress = 0,
    style,
}: {
    isRunning?: boolean;
    progress?: number;
    style?: StyleProp<ViewStyle>;
}) {
    const stage = useMemo(() => {
        const currentProgress = progress ?? 0;
        const sideProgress = 4;
        const middleProgress = 22;
        return Math.ceil(Math.max(currentProgress - sideProgress, 0) / middleProgress) + 1;
    }, [progress]);

    const clampedStage = Math.min(Math.max(stage, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
    const waterTranslateY = animationStageStyles.waterTranslateByStage[clampedStage];
    const waterDropBottom = animationStageStyles.waterDropBottomByStage[clampedStage];
    const fishStageStyle = animationStageStyles.fishByStage[clampedStage];

    return (
        <View style={[styles.container, style]} testID={`animations-stage-${clampedStage}`}>
            <WaterAnimation style={[styles.water, { transform: [{ translateY: waterTranslateY }] }]} />
            {waterDropBottom == null ? null : (
                <WaterDrapAnimation
                    isRunning={isRunning}
                    style={[styles.waterDropWrapper, { bottom: waterDropBottom }]}
                />
            )}
            <FishAnimation style={[styles.fish, fishStageStyle]} />
        </View>
    );
}