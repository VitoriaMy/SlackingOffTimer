import {
    useRive,
} from '@rive-app/react-webgl2';
import styles from './index.module.scss';
import { useState } from 'react';


export const RiveAnimation = () => {
    const [animations, setAnimations] = useState<string[]>([]);

    const { rive, RiveComponent } = useRive({
        src: "/animations/animation.riv",
        animations,
        autoplay: true,
    });


    const allAnimations = rive?.animationNames || [];

    const handleToggleAnimation = (name: string) => {

        setAnimations((prev) => {
            if (prev.includes(name)) {
                return prev.filter((anim) => anim !== name);
            } else {
                return [...prev, name];
            }
        });
    }

    const handleToggleAction = () => {
        if (!rive) return;


    }

    console.log(`render ---------->>>`, rive);


    return <div>
        <RiveComponent className={styles.animation} />

        {/* <button className={styles.button} onClick={handleToggleAction}>
            {isPlaying ? 'Pause' : 'Play'}
        </button> */}


        <div
            style={{
                height: 300,
                overflow: 'auto'
            }}
        >
            <h3>Available Animations:</h3>

            {
                allAnimations.map((name) => (<div
                    key={name}
                >
                    <button className={styles.button} onClick={() => handleToggleAnimation(name)}>
                        {name}
                    </button>
                    <div>{
                        animations.includes(name) ? 'used' : 'unuse'
                    }</div>
                </div>))
            }
        </div>


    </div>

}