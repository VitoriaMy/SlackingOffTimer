import { useMemo } from "react";
import { View } from "react-native";
import { FishAnimation } from "./fish";
import { WaterDrapAnimation } from "./waterDrap";
import type { AnimationStage } from "./types";
import { WaterAnimation } from "./water";
import styles from "./index.style";

export function Animations({
  isRunning = true,
  progress = 30,
}: {
  isRunning?: boolean;
  progress?: number;
}) {
  const stage = useMemo(() => {
    // 当前进度长度
    progress = progress ?? 0;
    // 默认两端的进度长度
    const sideProgress = 4;
    // 中间阶段的进度长度
    const middleProgress = 22;
    // 中间阶段的数量
    // 根据当前进度计算当前位于的阶段
    return Math.ceil(Math.max(progress - sideProgress, 0) / middleProgress) + 1;
  }, [progress]);

  const clampedStage = Math.min(Math.max(stage, 1), 6) as AnimationStage;

  return (
    <View style={styles.container}>
      <WaterAnimation
        stage={clampedStage}
      />
      <WaterDrapAnimation isRunning={isRunning} 
       stage={clampedStage}
      />
      <FishAnimation />
    </View>
  );
}
