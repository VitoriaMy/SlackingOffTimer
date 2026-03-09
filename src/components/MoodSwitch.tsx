import { useMemo, useRef } from "react";
import styles from "./MoodSwitch.module.scss";
import classNames from "classnames";

type MoodSwitchProps = {
    checked: boolean;
    onClick?: () => void;
    className?: string;
};

function FaceIcon({ happy, className }: { happy: boolean, className?: string }) {

    const id = useRef(Math.random().toString(36).slice(2));

    const keyPath = useMemo(() => {
        if (happy) {
            return "M11 14 A3 3 0 0 1 8.4 12.5";
        }
        return "M11 14 A3 3 0 0 0 8.4 15.5";
    }, [happy]);


    return (
        <svg className={className} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <defs>
                <mask id={`mood-switch-face-${id.current}`} x="1" y="1" width="20" height="20" maskUnits="userSpaceOnUse">
                    <path fill="#fff" d="M1 1h20v20H0z" />
                    <circle cx="7.7" cy="8.4" r="1.4" fill="#000" />
                    <circle cx="14.3" cy="8.4" r="1.4" fill="#000" />
                    <path id={`mood-switch-face-mouth-left-${id.current}`} d={keyPath} stroke="#000" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                    <use href={`#mood-switch-face-mouth-left-${id.current}`} transform="matrix(-1 0 0 1 22 0)" />
                </mask>
            </defs>
            <circle cx="11" cy="11" r="10" mask={`url(#mood-switch-face-${id.current})`} />
        </svg>
    );
}

function LineIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 37 20" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x=".5" y="9.5" width="36" height="1" rx=".5" />
    </svg>
}


export function MoodSwitch({ checked, onClick, className }: MoodSwitchProps) {

    return (
        <button
            type="button"
            className={classNames(
                styles.switch,
                className,
                {
                    [styles.checked]: checked,
                })}
            onClick={onClick}
        >
            <LineIcon className={styles.lineIcon} />
            <FaceIcon happy={checked} className={styles.faceIcon} />
        </button>
    );
}