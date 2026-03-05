import styles from "./statusCard.module.scss"

export function StatusCard() {
    return <div className={styles.statusCard}>
        <div className={styles.time}>12:34:34</div>
        <div className={styles.status}>休息中...</div>
    </div>
}