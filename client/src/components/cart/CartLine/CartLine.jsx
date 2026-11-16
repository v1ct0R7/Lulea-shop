import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../utils/format';
import ProductImage from '../../ui/ProductImage/ProductImage';
import QuantityInput from '../../ui/QuantityInput/QuantityInput';
import Icon from '../../ui/Icon/Icon';
import styles from './CartLine.module.css';

export default function CartLine({ item, index }) {
  const { setQty, remove } = useCart();
  return (
    <div className={styles.line}>
      <Link to={`/produkt/${item.slug}`} className={styles.thumb}>
        <ProductImage src={item.image} alt={item.name} accent={item.accent} seed={index} />
      </Link>
      <div className={styles.info}>
        <Link to={`/produkt/${item.slug}`} className={styles.name}>{item.name}</Link>
        <span className={styles.unit}>{formatPrice(item.price)} / copë</span>
        <QuantityInput small value={item.qty} onChange={(q) => setQty(item.productId, q)} />
      </div>
      <div className={styles.right}>
        <strong>{formatPrice(item.price * item.qty)}</strong>
        <button onClick={() => remove(item.productId)} aria-label={`Hiq ${item.name}`}><Icon name="trash" size={18} /></button>
      </div>
    </div>
  );
}
