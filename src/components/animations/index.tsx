import { FishAnimation } from "./fish";
import { WaterDrapAnimation } from "./WaterDrap";
import { WaterAnimation } from "./Water";
import { SandGlass } from "./SandGlass";

import styles from "./style.module.scss";


export function Animations({
  isRunning = true,
}: {
  isRunning?: boolean;
}) {
  return (
    <div className={styles.container}>
      <SandGlass className={styles.sandglass} />
      <WaterAnimation className={styles.water} />
      <FishAnimation className={styles.fish} />
      <div className={styles.waterDropWrapper}>
        <WaterDrapAnimation className={styles.waterDrop} isRunning={isRunning} />
      </div>
    </div>
  );
}
