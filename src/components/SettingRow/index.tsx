import styles from "./index.module.scss";

interface SettingRow {
  label: string;
  children: React.ReactNode;
  more?: React.ReactNode;
}

export function SettingRow({ label, children, more }: SettingRow) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.rowHead}>
        <div className={styles.label}>{label}</div>
        {more && <div className={styles.more}>{more}</div>}
      </div>
      <div className={styles.control}>{children}</div>
    </div>
  );
}
