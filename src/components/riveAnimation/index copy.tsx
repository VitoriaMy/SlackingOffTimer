import {
    useRive,
} from '@rive-app/react-webgl2';
import styles from './index.module.scss';
import { useEffect, useMemo, useState } from 'react';

const animationConfig = {
    "activeArtboard": "Artboard",
    "animationNames": [
        "WALK",
        "Idle Loop",
        "01 Wave 1",
        "X",
        "idle to Pose 1",
        "Pose 1 loop",
        "Kedip",
        "Y",
        "01 Wave 2"
    ],
    "stateMachineNames": [
        "State Machine 1"
    ],
    "playingAnimationNames": [],
    "playingStateMachineNames": [],
    "pausedAnimationNames": [
        "WALK"
    ],
    "pausedStateMachineNames": [],
    "isPlaying": false,
    "isPaused": true,
    "isStopped": false,
    "bounds": {
        "minX": 0,
        "minY": 0,
        "maxX": 1600,
        "maxY": 1200
    }
}

export const RiveAnimation = () => {
    const defaultAnimationName = useMemo(() => {
        return (
            animationConfig.playingAnimationNames[0] ??
            animationConfig.pausedAnimationNames[0] ??
            animationConfig.animationNames[0]
        );
    }, []);

    const [currentAnimationIndex, setCurrentAnimationIndex] = useState(() => {
        const index = animationConfig.animationNames.indexOf(defaultAnimationName);
        return index >= 0 ? index : 0;
    });
    const [isPaused, setIsPaused] = useState(animationConfig.isPaused);

    const currentAnimationName = animationConfig.animationNames[currentAnimationIndex];

    const { rive, RiveComponent } = useRive({
        src: "/animations/animation.riv",
        artboard: animationConfig.activeArtboard,
        stateMachines: animationConfig.stateMachineNames,
        animations: defaultAnimationName,
        autoplay: animationConfig.isPlaying,
    });

    const handleToggleAnimation = () => {
        setCurrentAnimationIndex((prev) => {
            return (prev + 1) % animationConfig.animationNames.length;
        });
    }

    const handleToggleAction = () => {
        if (!rive) return;

        if (isPaused) {
            rive.play(currentAnimationName);
            setIsPaused(false);
        } else {
            rive.pause(currentAnimationName);
            setIsPaused(true);
        }
    }

    useEffect(() => {
        if (!rive) return;

        // 切换动画前先停止已有动画，避免多个线性动画叠加
        rive.stop(animationConfig.animationNames);
        rive.play(currentAnimationName);

        if (isPaused) {
            rive.pause(currentAnimationName);
        }
    }, [rive, currentAnimationName, isPaused]);


    return <div>
        <RiveComponent className={styles.animation} />
        <button className={styles.button} onClick={handleToggleAnimation}>
            Next Animation: {currentAnimationName}
        </button>
        <button className={styles.button} onClick={handleToggleAction}>
            {isPaused ? 'Play' : 'Pause'}
        </button>

    </div>

}