import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import styles from "./water.module.scss";
import { useMemo } from "react";
import classNames from "classnames";

export function WaterAnimation({ className, stage }: { className?: string, stage?: number }) {


  return (
    <div className={classNames(styles.water, className)}>
      <DotLottieReact
        className={classNames(styles.watterAnimation, styles[`stage_${stage}`])}
        src="/animations/water.json"
        autoplay={true}
        loop={true}
      />
    </div>
  );
}
