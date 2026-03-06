import { FishAnimation } from '@/components/animations/fish';
import { WaterAnimation } from '@/components/animations/water';
import styles from './page.module.scss';

export function AnimationsPage() {
    return <div>
        {/* <FishAnimation />
        <hr />
        <WaterAnimation />
        <hr /> */}

        <div className={styles.container}>
            <WaterAnimation className={styles.water} />
            <FishAnimation className={styles.fish} />
        </div>
    </div>

}