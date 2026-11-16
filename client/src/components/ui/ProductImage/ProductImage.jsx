import { useState } from 'react';
import FloralArt from '../FloralArt/FloralArt';
import styles from './ProductImage.module.css';

/** Shfaq foton e produktit, ose një ilustrim elegant nëse mungon / s’ngarkohet. */
export default function ProductImage({ src, alt, accent = '#7d6560', seed = 0, className = '', eager }) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <div className={`${styles.wrap} ${className}`} style={{ '--accent': accent }}>
      {showImg ? (
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
      ) : (
        <FloralArt color={accent} variant={seed} className={styles.art} />
      )}
    </div>
  );
}
