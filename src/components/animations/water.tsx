import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";
import classNames from "classnames";
import styles from "./style.module.scss";

const stepTimes = {
  1: 1000,
  2: 1500,
};

export function WaterAnimation({ className }: { className?: string }) {
  const animationRef = useRef<DotLottie | null>(null);
  const timeIdRef = useRef<number>(0);
  const currentStepRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [step, setStep] = useState(0);

  const handleRunAnimation = useCallback(() => {
    console.log(`handleRunAnimation ------>>>`, 1);

    if (!animationRef.current) {
      return;
    }
    console.log(`handleRunAnimation ------>>>`, 2);

    currentStepRef.current = currentStepRef.current || 0;
    const currentStep = (currentStepRef.current + 1) % 3;
    currentStepRef.current = currentStep;
    setStep(currentStep);

    console.log(`handleRunAnimation ------>>>`, 3, currentStep);

    if (currentStep) {
      timeIdRef.current = setTimeout(
        () => {
          handleRunAnimation();
        },
        stepTimes[currentStep as keyof typeof stepTimes],
      );
    } else {
      animationRef.current.play();
    }
  }, []);

  const handleAnimationLoad = useCallback(() => {
    setIsReady(true);
  }, []);
  const handleAnimationComplete = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.setFrame(0);
      animationRef.current.stop();
    }
    handleRunAnimation();
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
    if (!isReady || !animationRef.current) return;
    currentStepRef.current = currentStepRef.current || 1;
    handleRunAnimation();
    return () => {
      if (timeIdRef.current) {
        clearTimeout(timeIdRef.current);
      }
    };
  }, [isReady, handleRunAnimation]);

  return (
    <div className={classNames(className, styles[`step${step}`])}>
      <DotLottieReact
        dotLottieRefCallback={handleLoad}
        src="/animations/waterdrop.json"
        autoplay={false}
        loop={false}
      />
    </div>
  );
}
