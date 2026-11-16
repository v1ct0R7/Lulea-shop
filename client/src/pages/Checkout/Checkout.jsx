import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';
import Seo from '../../components/ui/Seo/Seo';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Button from '../../components/ui/Button/Button';
import DeliveryForm, { emptyDelivery } from '../../components/checkout/DeliveryForm/DeliveryForm';
import OrderSummary from '../../components/cart/OrderSummary/OrderSummary';
import styles from './Checkout.module.css';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyDelivery);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0 && !sending) return <Navigate to="/shporta" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const order = await api.createOrder({
        type: 'standard',
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        ...form,
      });
      clear();
      navigate('/porosia/sukses', { replace: true, state: { order, name: form.customer.fullName } });
    } catch (err) {
      setError(err.message);
      setSending(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Seo title="Përfundo porosinë" noindex />
      <PageHeader title="Përfundo porosinë" text="Plotësoni të dhënat për dërgesë. Pagesa bëhet cash kur të merrni lulet." />
      <form className={`container section ${styles.grid}`} onSubmit={submit}>
        <div>
          {error && <div className={`alert alert-error ${styles.err}`}>{error}</div>}
          <DeliveryForm value={form} onChange={setForm} />
        </div>
        <OrderSummary
          subtotal={subtotal}
          lines={items.map((i) => ({ label: `${i.qty} × ${i.name}`, value: formatPrice(i.qty * i.price) }))}
        >
          <Button type="submit" size="lg" block loading={sending}>Konfirmo porosinë</Button>
          <p className={styles.terms}>Duke konfirmuar, pranoni që t’ju kontaktojmë në telefon për konfirmim.</p>
        </OrderSummary>
      </form>
    </>
  );
}
