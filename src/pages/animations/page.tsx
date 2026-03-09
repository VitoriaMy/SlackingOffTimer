// import { FishAnimation } from '@/components/animations/fish';
// import { WaterAnimation } from '@/components/animations/water';
import { Animations } from '@/components/animations';
import styles from './page.module.scss';

export function AnimationsPage() {
    return <div>
        {/* <FishAnimation />
        <hr />
        <WaterAnimation />
        <hr /> */}

        <div className={styles.container}>
            <Animations />
        </div>
    </div>

}