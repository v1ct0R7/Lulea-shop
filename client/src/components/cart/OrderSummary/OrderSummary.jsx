import { useShop } from '../../../context/ShopContext';
import { formatPrice } from '../../../utils/format';
import Icon from '../../ui/Icon/Icon';
import styles from './OrderSummary.module.css';

/** Përmbledhja e çmimit: nëntotali, dërgesa dhe totali. lines = [{ label, value }] */
export default function OrderSummary({ title = 'Përmbledhja e porosisë', lines = [], subtotal, children }) {
  const { settings } = useShop();
  const fee = settings ? (subtotal >= settings.freeDeliveryFrom ? 0 : settings.deliveryFee) : 0;
  const missing = settings ? settings.freeDeliveryFrom - subtotal : 0;

  return (
    <aside className={styles.box}>
      <h2 className={styles.title}>{title}</h2>
      {lines.length > 0 && (
        <ul className={styles.lines}>
          {lines.map((l, i) => (
            <li key={i}><span>{l.label}</span><span>{l.value}</span></li>
          ))}
        </ul>
      )}
      <div className={styles.row}><span>Nëntotali</span><span>{formatPrice(subtotal)}</span></div>
      <div className={styles.row}>
        <span>Dërgesa</span>
        <span>{fee === 0 ? 'Falas' : formatPrice(fee)}</span>
      </div>
      {missing > 0 && (
        <p className={styles.hint}>Shtoni edhe {formatPrice(missing)} për dërgesë falas.</p>
      )}
      <div className={`${styles.row} ${styles.total}`}><span>Totali</span><span>{formatPrice(subtotal + fee)}</span></div>
      <div className={styles.pay}><Icon name="cash" size={18} /> Pagesa bëhet cash në momentin e dorëzimit</div>
      {children}
    </aside>
  );
}
