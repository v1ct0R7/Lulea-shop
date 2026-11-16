import { useShop } from '../../../context/ShopContext';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products }) {
  const { categories } = useShop();
  const accentOf = (p) => categories.find((c) => c.id === p.categoryId)?.accent;
  return (
    <div className={styles.grid}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} accent={accentOf(p)} index={i} />
      ))}
    </div>
  );
}
