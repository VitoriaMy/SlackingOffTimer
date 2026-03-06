import { useMemo } from "react";
import styles from "./BottonSwitch.module.scss";
import classNames from "classnames";

interface BottonSwitchProps {
  className?: string;
  checked: boolean;
  label: string;
  onClick?: () => void;
}

export function BottonSwitch({ className, checked, label, onClick }: BottonSwitchProps) {
  const children = useMemo(() => {
    return label.split("").map((char, index) => {
      return <span key={index}>{char}</span>;
    });
  }, [label]);
  return (
    <button
      className={classNames(
        styles.bottonSwitch,
        {
          [styles.checked]: checked,
        },
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
