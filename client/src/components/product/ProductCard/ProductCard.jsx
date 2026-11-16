import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../utils/format';
import ProductImage from '../../ui/ProductImage/ProductImage';
import Icon from '../../ui/Icon/Icon';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, accent, index = 0 }) {
  const { add } = useCart();
  const url = `/produkt/${product.slug}`;
  const sale = product.oldPrice && product.oldPrice > product.price;

  return (
    <article className={`${styles.card} fade-in`} style={{ animationDelay: `${(index % 8) * 50}ms` }}>
      <div className={styles.mediaWrap}>
      <Link to={url} className={styles.media} aria-label={product.name}>
        <ProductImage src={product.image} alt={product.name} accent={accent} seed={index} />
        <div className={styles.tags}>
          {sale && <span className={styles.sale}>Ofertë</span>}
          {!product.inStock && <span className={styles.out}>Pa stok</span>}
        </div>
      </Link>
      <button
        className={styles.quick}
        onClick={() => add({ ...product, accent })}
        disabled={!product.inStock}
        aria-label={`Shto ${product.name} në shportë`}
      >
        <Icon name="bag" size={18} /> <span>Shto në shportë</span>
      </button>
      </div>
      <div className={styles.body}>
        {product.type && <span className={styles.type}>{product.type.name}</span>}
        <h3 className={styles.title}><Link to={url}>{product.name}</Link></h3>
        <div className={styles.price}>
          <span>{formatPrice(product.price)}</span>
          {sale && <s>{formatPrice(product.oldPrice)}</s>}
        </div>
      </div>
    </article>
  );
}
