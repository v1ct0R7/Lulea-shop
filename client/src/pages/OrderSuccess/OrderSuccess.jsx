import { Navigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { formatPrice } from '../../utils/format';
import Seo from '../../components/ui/Seo/Seo';
import Button from '../../components/ui/Button/Button';
import Icon from '../../components/ui/Icon/Icon';
import FloralArt from '../../components/ui/FloralArt/FloralArt';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const { state } = useLocation();
  const { settings } = useShop();
  if (!state?.order) return <Navigate to="/" replace />;
  const { order, name } = state;

  return (
    <div className={`container ${styles.wrap}`}>
      <Seo title="Faleminderit për porosinë" noindex />
      <div className={styles.card}>
        <FloralArt className={styles.art} color="#c98b8b" />
        <div className={styles.check}><Icon name="check" size={28} stroke={2} /></div>
        <h1>Faleminderit{name ? `, ${name.split(' ')[0]}` : ''}!</h1>
        <p>Porosia juaj u pranua me sukses. Do t’ju telefonojmë së shpejti për ta konfirmuar.</p>
        <dl className={styles.meta}>
          <div><dt>Numri i porosisë</dt><dd>{order.number}</dd></div>
          <div><dt>Totali për t’u paguar</dt><dd>{formatPrice(order.total)}</dd></div>
          <div><dt>Pagesa</dt><dd>Cash në dorëzim</dd></div>
        </dl>
        <p className={styles.small}>Keni pyetje? Na telefononi në <a href={`tel:${settings?.phone?.replace(/\s/g, '')}`}>{settings?.phone}</a></p>
        <Button to="/">Kthehu në ballinë</Button>
      </div>
    </div>
  );
}
