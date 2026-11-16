import FloralArt from '../FloralArt/FloralArt';
import styles from './EmptyState.module.css';
export default function EmptyState({ title, text, children }) {
  return (
    <div className={styles.wrap}>
      <FloralArt className={styles.art} color="#b9a39c" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
