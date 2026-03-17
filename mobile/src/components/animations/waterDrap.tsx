import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import waterDropAnimation from "~/animations/waterdrop.json";
import { UniversalLottie } from "./UniversalLottie";
import styles from "./waterDrap.style";
import type { AnimationStage } from "./types";
import { rs } from "@/core/responsive";

type DropPhase = 1 | 2 | 3;

// const sta

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

  const scale = useRef(new Animated.Value(0)).current;
  const offsetY = useRef(new Animated.Value(0)).current;
  const activeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const phase_1 = () => {
    scale.setValue(0);
    offsetY.setValue(0);
    const widthAnim = Animated.timing(scale, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    activeAnimationRef.current = widthAnim;
    widthAnim.start(({ finished }) => {
      if (finished) {
        setPhase(2);
        phase_2();
      }
    });
  };

  const phase_2 = () => {
    offsetY.setValue(0);
    const offsetYAnim = Animated.timing(offsetY, {
      toValue: wrapperSize.height,
      duration: 1400,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });
    activeAnimationRef.current = offsetYAnim;
    offsetYAnim.start(({ finished }) => {
      if (finished) {
        setPhase(3);
      }
    });
  };

  const phase_reset = () => {
    scale.setValue(0);
    offsetY.setValue(0);
    setPhase(1);
    phase_1();
  };

  const handleLottieFinish = useCallback(() => {
    phase_reset();
    setPlaySerial((prev) => prev + 1);
  }, [wrapperSize]);

  useEffect(() => {
    if (isRunning) {
      if (phase === 1) {
        phase_1();
      } else if (phase === 2) {
        phase_2();
      }
    } else {
      activeAnimationRef.current?.stop();
    }
    return () => {
      activeAnimationRef.current?.stop();
    };
  }, [isRunning, wrapperSize]);

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
          styles.waterDrop,
          {
            transform: [
              {
                translateY: offsetY,
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.waterDropInner,
            {
              transform: [
                {
                  scale,
                },
              ],
            },
          ]}
        >
          <UniversalLottie
            key={playSerial}
            source={waterDropAnimation}
            dotLottieSource={require("~/animations/waterdrop.json")}
            loop={false}
            autoplay={phase === 3}
            onAnimationFinish={handleLottieFinish}
            style={styles.waterDropAnimation}
            onLoadError={() => {
              console.warn("Water drop animation failed to load");
            }}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
