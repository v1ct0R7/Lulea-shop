import { Link } from 'react-router-dom';
import ProductImage from '../../ui/ProductImage/ProductImage';
import Icon from '../../ui/Icon/Icon';
import styles from './CategoryCard.module.css';

export default function CategoryCard({ category, index = 0 }) {
  return (
    <Link to={`/kategori/${category.slug}`} className={`${styles.card} fade-in`} style={{ animationDelay: `${index * 70}ms` }}>
      <ProductImage src={category.image} alt={category.name} accent={category.accent} seed={index} className={styles.img} />
      <div className={styles.overlay}>
        <h3>{category.name}</h3>
        <p>{category.types.map((t) => t.name).slice(0, 3).join(' · ')}</p>
        <span className={styles.more}>Shiko {category.productCount} produkte <Icon name="arrow" size={16} /></span>
      </div>
    </Link>
  );
}
