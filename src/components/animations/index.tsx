import { FishAnimation } from "./fish";
import { WaterDrapAnimation } from "./WaterDrap";
// import { WaterAnimation } from "./Water";
import styles from "./style.module.scss";
import { useMemo } from "react";
import classNames from "classnames";


export function Animations({
  isRunning = true,
  progress = 0,
  className,
}: {
  isRunning?: boolean;
  progress?: number;
  className?: string;
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

  return (
    <div className={classNames(styles.container, className)}>
      {/* <WaterAnimation className={styles.water} stage={stage} /> */}
      <FishAnimation className={classNames(styles.fish, styles[`stage_${stage}`])} />
      <WaterDrapAnimation className={classNames(styles.waterDropWrapper, styles[`stage_${stage}`])} isRunning={isRunning} />
    </div>
  );
}
