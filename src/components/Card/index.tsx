import styles from "./index.module.scss";

interface CardProps {
  label: string;
  value: string;
}
export function Card({ label, value }: CardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
