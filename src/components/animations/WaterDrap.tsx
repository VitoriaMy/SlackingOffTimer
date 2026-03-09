import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";
import classNames from "classnames";
import styles from "./style.module.scss";

const stepTimes = {
  1: {
    hander: (callback: () => void) => {
      return setTimeout(() => {
        callback();
      }, 1000);
    }
  },
  2: {
    hander: (callback: () => void) => {
      return setTimeout(() => {
        callback();
      }, 1400);
    }
  },
  3: {
    hander: (callback: () => void, animation: DotLottie) => {
      animation.setFrame(34);
      animation.play();
    },
  }
};

export function WaterDrapAnimation({ className, isRunning }: { className?: string, isRunning: boolean }) {
  const animationRef = useRef<DotLottie | null>(null);
  const timeIdRef = useRef<number | void>();
  const currentStepRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [step, setStep] = useState(0);

  const handleRunAnimation = useCallback(() => {
    if (!animationRef.current) {
      return;
    }
    currentStepRef.current = currentStepRef.current || 0;
    const currentStep = (currentStepRef.current + 1) % 4;
    currentStepRef.current = currentStep;

    const currentStepTime = stepTimes[currentStep as keyof typeof stepTimes];

    setStep(currentStep);
    if (currentStepTime) {
      timeIdRef.current = currentStepTime.hander(() => {
        handleRunAnimation();
      }, animationRef.current);
    }
  }, []);

  const handleAnimationLoad = useCallback(() => {
    setIsReady(true);
  }, []);
  const handleAnimationComplete = useCallback(() => {
    if (animationRef.current) {
      currentStepRef.current = 0;
      setStep(0);
      animationRef.current.setFrame(34);
      animationRef.current.stop();
    }
    setTimeout(() => {
      handleRunAnimation();
    }, 100);
  }, []);
  const handleLoad = useCallback(
    (instance: DotLottie) => {
      if (!instance) return;
      animationRef.current = instance;
      instance.addEventListener("load", handleAnimationLoad);
      instance.addEventListener("complete", handleAnimationComplete);
    },
    [handleAnimationComplete, handleAnimationLoad],
  );

  useEffect(() => {
    if (!isRunning || !isReady || !animationRef.current) return;
    currentStepRef.current = currentStepRef.current || 0;
    handleRunAnimation();
    return () => {
      if (timeIdRef.current) {
        clearTimeout(timeIdRef.current);
      }
      if(animationRef.current) {
        animationRef.current.stop();
        animationRef.current.setFrame(34);
      }
      currentStepRef.current = 0;
      setStep(0);
    };
  }, [isReady, handleRunAnimation, isRunning]);

  return (
    <div className={classNames(className, styles[`step${step}`])}>
      <DotLottieReact
        dotLottieRefCallback={handleLoad}
        src="/animations/waterdrop.json"
        autoplay={false}
        loop={false}
        renderConfig={{
          wasmUrl: '/animations/dotlottie-player.wasm',
        }}
      />
    </div>
  );
}
