import { FishAnimation } from "./fish";
import { WaterAnimation } from "./water";
import { SandGlass } from "./SandGlass";

import styles from "./style.module.scss";

export function Animations() {
  return (
    <div className={styles.container}>
      <SandGlass className={styles.sandglass} />
      <FishAnimation className={styles.fish} />
    </div>
  );
}
