import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import styles from "./style.module.scss";

interface ModalProps {
    className?: string;
    maskClassName?: string;
    children: React.ReactNode;
    onCancel: () => void;
    onOk?: () => void;
    hideCancel?: boolean;
    hideOk?: boolean;
    cancelText?: string;
    okText?: string;
    maskClosable?: boolean;
    getContainer?: HTMLElement | string | (() => HTMLElement | null) | null;
}

function resolveContainer(getContainer: ModalProps["getContainer"]) {
    if (typeof document === "undefined") {
        return null;
    }

    if (getContainer === undefined) {
        return document.body;
    }

    if (typeof getContainer === "string") {
        return document.querySelector(getContainer);
    }

    if (typeof getContainer === "function") {
        return getContainer();
    }

    return getContainer;
}

export function Modal({
    className,
    maskClassName,
    children,
    onCancel,
    onOk,
    hideCancel = false,
    hideOk = false,
    cancelText = "Cancel",
    okText = "OK",
    maskClosable = true,
    getContainer,
}: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const container = useMemo(() => resolveContainer(getContainer), [getContainer]);

    if (!mounted || !container) {
        return null;
    }

    const node = <div
        className={classNames(styles.modalMask, maskClassName)}
        onClick={maskClosable ? onCancel : undefined}
    >
        <div
            role="dialog"
            aria-modal="true"
            className={classNames(styles.modal, className)}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={styles.content}>{children}</div>
            {(!hideCancel || !hideOk) && (
                <div className={styles.footer}>
                    {!hideCancel && (
                        <button type="button" className={classNames(styles.button, styles.cancel)} onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                    {!hideOk && (
                        <button type="button" className={classNames(styles.button, styles.ok)} onClick={onOk}>
                            {okText}
                        </button>
                    )}
                </div>
            )}
        </div>
    </div>;

    return createPortal(node, container);
}