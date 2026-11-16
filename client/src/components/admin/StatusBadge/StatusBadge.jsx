import { ORDER_STATUS } from '../../../utils/format';
import styles from './StatusBadge.module.css';
export default function StatusBadge({ status, label, tone }) {
  const s = ORDER_STATUS[status] || { label, tone };
  return <span className={`${styles.badge} ${styles[s.tone || 'muted']}`}>{s.label || label}</span>;
}
