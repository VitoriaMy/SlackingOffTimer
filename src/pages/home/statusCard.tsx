import { usei18n } from "@/hooks/usei18n";
import { useCurrentSlackingDuration } from "@/hooks/useCurrentSlackingDuration";
import { useIsWorkTime } from "@/hooks/useIsWorkTime";
import { useSlackRecord } from "@/hooks/useSlackRecord";
import styles from "./statusCard.module.scss"

export function StatusCard({
    recordSlackSwitch,
    currentSwitchState,
}: {
    recordSlackSwitch: () => void;
    currentSwitchState: number;
}) {
    const i18n = usei18n();
    const isWorkTime = useIsWorkTime(10);
    const { durationText } = useCurrentSlackingDuration();
    const checked = currentSwitchState === 1;
    const statusText = isWorkTime ? i18n("standby") : i18n("offWork");
    return <div className={styles.statusCard}>
        {/* 已经摸鱼时间 */}
        <div className={styles.time}>{durationText}</div>
        <div className={styles.status}>{statusText}</div>
        <button type="button" onClick={recordSlackSwitch} className={styles.triggerButton}>
            {checked ? i18n("stopSession") : i18n("startSession")}
        </button>
    </div>
}