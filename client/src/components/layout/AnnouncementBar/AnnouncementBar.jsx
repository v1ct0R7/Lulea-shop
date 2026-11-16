import { useShop } from '../../../context/ShopContext';
import { formatPrice } from '../../../utils/format';
import styles from './AnnouncementBar.module.css';
export default function AnnouncementBar() {
  const { settings } = useShop();
  return (
    <div className={styles.bar}>
      Dërgesë falas për porosi mbi {formatPrice(settings?.freeDeliveryFrom ?? 50)} · Pagesë cash në dorëzim
    </div>
  );
}
