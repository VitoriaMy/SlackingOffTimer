import { Animations } from '@/components/animations';
import styles from './page.module.scss';
import { useState } from 'react';
import { Layout } from '@/components/layout';

export function AnimationsPage() {
    const [isRunning, setIsRunning] = useState(true);
    return <Layout
     header={{
        title: '动画演示'
     }}
    >
        <div className={styles.container}>
            <Animations isRunning={isRunning} />
            <button className={styles.toogler} onClick={() => setIsRunning(!isRunning)}>{isRunning ? 'Stop' : 'Start'} Animations</button>
        </div>
    </Layout>
}