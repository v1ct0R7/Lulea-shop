import styles from './Spinner.module.css';
export default function Spinner({ label = 'Duke u ngarkuar…' }) {
  return (
    <div className={styles.wrap} role="status">
      <span className={styles.spin} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
