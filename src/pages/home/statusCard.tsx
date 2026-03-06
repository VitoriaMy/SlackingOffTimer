import { usei18n } from "@/hooks/usei18n";
import styles from "./statusCard.module.scss"

export function StatusCard() {
    const i18n = usei18n();

    return <div className={styles.statusCard}>
        <div className={styles.time}>04:23:15</div>
        <div className={styles.status}>{i18n("waitingForWork")}</div>
    </div>
}