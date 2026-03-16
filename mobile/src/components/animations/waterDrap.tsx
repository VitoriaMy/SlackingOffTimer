import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import waterDropAnimation from "~/animations/waterdrop.json";
import { UniversalLottie } from "./UniversalLottie";
import styles from "./waterDrap.style";
import type { AnimationStage } from "./types";

type DropPhase = 1 | 2 | 3;

const GROW_DURATION = 1000;
const FALL_DURATION = 1400;

export function WaterDrapAnimation({
  isRunning = true,
  stage,
}: {
  isRunning?: boolean;
  stage: AnimationStage;
}) {
  const [phase, setPhase] = useState<DropPhase>(1);
  const [playSerial, setPlaySerial] = useState(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

  const scale = useRef(new Animated.Value(0.01)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const activeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const targetWidth = Math.max(wrapperSize.width * 0.26, 1);
  const targetTop = Math.max(wrapperSize.height, 1);
  const leftOffset = wrapperSize.width * 0.37;

  const resetDrop = useCallback(() => {
    activeAnimationRef.current?.stop();
    scale.setValue(0.01);
    translateY.setValue(0);
    setPhase(1);
  }, [scale, translateY]);

  const runPhase2 = useCallback(() => {
    setPhase(2);
    const fall = Animated.timing(translateY, {
      toValue: targetTop,
      duration: FALL_DURATION,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    activeAnimationRef.current = fall;
    fall.start(({ finished }) => {
      if (finished && isRunning) {
        setPhase(3);
        setPlaySerial((v) => v + 1);
      }
    });
  }, [isRunning, targetTop, translateY]);

  const runPhase1 = useCallback(() => {
    setPhase(1);
    translateY.setValue(0);
    scale.setValue(0.01);

    const grow = Animated.timing(scale, {
      toValue: 1,
      duration: GROW_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    activeAnimationRef.current = grow;
    grow.start(({ finished }) => {
      if (finished && isRunning) {
        runPhase2();
      }
    });
  }, [isRunning, runPhase2, scale, translateY]);

  const handleLottieFinish = useCallback(() => {
    if (!isRunning || phase !== 3) {
      return;
    }

    runPhase1();
  }, [isRunning, phase, runPhase1]);

  useEffect(() => {
    if (!isRunning) {
      resetDrop();
      return;
    }

    if (wrapperSize.width <= 0 || wrapperSize.height <= 0) {
      return;
    }

    runPhase1();

    return () => {
      activeAnimationRef.current?.stop();
    };
  }, [isRunning, resetDrop, runPhase1, wrapperSize.height, wrapperSize.width]);

  return (
    <View
      style={[styles.waterDropWrapper, styles[`stage_${stage}`]]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width !== wrapperSize.width || height !== wrapperSize.height) {
          setWrapperSize({ width, height });
        }
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: leftOffset,
            top: 0,
            width: targetWidth,
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <UniversalLottie
          key={playSerial}
          source={waterDropAnimation}
          dotLottieSource={require("~/animations/waterdrop.json")}
          loop={false}
          autoplay={phase === 3 && isRunning}
          onAnimationFinish={handleLottieFinish}
          style={{ width: "100%", aspectRatio: 1 }}
          onLoadError={() => {
            console.warn("Water drop animation failed to load");
          }}
        />
      </Animated.View>
    </View>
  );
}
