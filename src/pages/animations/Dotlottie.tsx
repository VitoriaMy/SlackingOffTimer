import { Animations } from '@/components/animations';
import styles from './page.module.scss';
import { useState } from 'react';

export function Dotlottie() {
    const [isRunning, setIsRunning] = useState(true);
    const [progress, setProgress] = useState(0);

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProgress = Number(e.target.value);
        setProgress(newProgress);
    }
    return (<>
        <Animations isRunning={isRunning} progress={progress} />
        <input
            className={styles.slider}
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
        />
        <button className={styles.toogler} onClick={() => setIsRunning(!isRunning)}>{isRunning ? 'Stop' : 'Start'} Animations</button>
    </>)
}