import { useEffect, useMemo, useRef, useState } from "react";
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
            return "M10 13 A3 3 0 0 1 7.4 11.5";
        }
        return "M10 13 A3 3 0 0 0 7.4 14.5";
    }, [happy]);


    return (
        <svg className={className} width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <defs>
                <mask id={`mood-switch-face-${id.current}`} x="0" y="0" width="20" height="20" maskUnits="userSpaceOnUse">
                    <path fill="#fff" d="M0 0h20v20H0z" />
                    <circle cx="6.7" cy="7.4" r="1.4" fill="#000" />
                    <circle cx="13.3" cy="7.4" r="1.4" fill="#000" />
                    <path id={`mood-switch-face-mouth-left-${id.current}`} d={keyPath} stroke="#000" strokeWidth="1.4" strokeLinecap="round"
                        fill="none" />
                    <use href={`#mood-switch-face-mouth-left-${id.current}`} transform="matrix(-1 0 0 1 20 0)" />
                </mask>
            </defs>
            <circle cx="10" cy="10" r="10" mask={`url(#mood-switch-face-${id.current})`} />
        </svg>

    );
}

function LineIcon({ className }: { className?: string }) {
    return <svg className={className} width="37" height="20" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
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