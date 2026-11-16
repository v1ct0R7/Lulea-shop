import { useCart } from '../../context/CartContext';
import Seo from '../../components/ui/Seo/Seo';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Button from '../../components/ui/Button/Button';
import EmptyState from '../../components/ui/EmptyState/EmptyState';
import CartLine from '../../components/cart/CartLine/CartLine';
import OrderSummary from '../../components/cart/OrderSummary/OrderSummary';
import styles from './Cart.module.css';

export default function Cart() {
  const { items, subtotal, count } = useCart();
  return (
    <>
      <Seo title="Shporta" noindex />
      <PageHeader title="Shporta juaj" text={count ? `${count} artikuj në shportë` : undefined} />
      <div className="container section">
        {items.length === 0 ? (
          <EmptyState title="Shporta është bosh" text="Ende s’keni shtuar asnjë lule. Le ta ndryshojmë këtë!">
            <Button to="/dyqani">Shfleto lulet</Button>
          </EmptyState>
        ) : (
          <div className={styles.grid}>
            <div>
              {items.map((it, i) => <CartLine key={it.productId} item={it} index={i} />)}
              <Button to="/dyqani" variant="ghost" className={styles.back}>← Vazhdo blerjet</Button>
            </div>
            <OrderSummary subtotal={subtotal}>
              <Button to="/porosia" size="lg" block>Vazhdo te porosia</Button>
            </OrderSummary>
          </div>
        )}
      </div>
    </>
  );
}
