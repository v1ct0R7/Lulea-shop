import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import { useFetch } from '../../../hooks/useFetch';
import { ORDER_STATUS, formatDate, formatPrice } from '../../../utils/format';
import Icon from '../../../components/ui/Icon/Icon';
import Spinner from '../../../components/ui/Spinner/Spinner';
import StatusBadge from '../../../components/admin/StatusBadge/StatusBadge';
import OrderDetail from './OrderDetail';

/** Lista e numrave të bllokuar, me mundësi zhbllokimi */
function BlockedPhones() {
  const { data, reload } = useFetch(() => api.getBlocked(), []);
  useEffect(() => {
    window.addEventListener('lulea:orders-changed', reload);
    return () => window.removeEventListener('lulea:orders-changed', reload);
  }, [reload]);
  if (!data?.length) return null;
  return (
    <div className="adm-card" style={{ marginTop: 24 }}>
      <div className="adm-toolbar"><strong>Numrat e bllokuar ({data.length})</strong></div>
      <table className="adm-table">
        <tbody>
          {data.map((b) => (
            <tr key={b.phone}>
              <td>{b.display}<br /><small className="adm-muted">{b.name}</small></td>
              <td className="adm-muted">{b.reason}</td>
              <td className="adm-muted">{formatDate(b.at)}</td>
              <td><div className="adm-actions"><button className="adm-icon-btn" style={{ width: 'auto', padding: '0 10px' }} onClick={async () => { await api.unblockPhone(b.phone); reload(); }}>Zhblloko</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  const { data: orders, loading, reload, setData } = useFetch(() => api.getOrders({ status, type, q }), [status, type, q]);

  // rifresko kur vjen porosi e re
  useEffect(() => {
    window.addEventListener('lulea:new-order', reload);
    return () => window.removeEventListener('lulea:new-order', reload);
  }, [reload]);

  const open = orders?.find((o) => o.id === openId);

  const onUpdated = (o) => {
    setData(orders.map((x) => (x.id === o.id ? o : x)));
    if (o.status === 'cancelled') reload(); // rifresko historikun e klientëve
    window.dispatchEvent(new Event('lulea:orders-changed'));
  };
  const onDeleted = (id) => {
    setData(orders.filter((x) => x.id !== id));
    setOpenId(null);
    window.dispatchEvent(new Event('lulea:orders-changed'));
  };

  const setStatus = (s) => setParams(s ? { status: s } : {}, { replace: true });

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Porositë</h1>
          <p>Porositë e reja shfaqen automatikisht (rifreskim çdo 15 sekonda) me njoftim zanor.</p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="input" type="search" placeholder="Kërko sipas numrit, emrit ose telefonit…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Statusi">
            <option value="">Të gjitha statuset</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Lloji">
            <option value="">Të gjitha llojet</option>
            <option value="standard">Nga dyqani</option>
            <option value="custom">Të personalizuara</option>
          </select>
        </div>

        {loading && !orders ? <Spinner /> : !orders?.length ? (
          <p className="adm-empty">Nuk ka porosi me këto filtra.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Porosia</th><th>Klienti</th><th>Dërgesa</th><th>Lloji</th><th>Totali</th><th>Statusi</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className={`clickable ${!o.seen ? 'unseen' : ''}`} onClick={() => setOpenId(o.id)}>
                    <td>
                      <strong>{o.number}</strong> {!o.seen && <StatusBadge label="E re" tone="warn" />}
                      <br /><small className="adm-muted">{formatDate(o.createdAt, true)}</small>
                    </td>
                    <td>
                      {o.customer.fullName}{' '}
                      {o.history_customer?.cancelled > 0 ? <StatusBadge label="Kujdes" tone="danger" /> : o.history_customer?.delivered > 0 ? <StatusBadge label="Klient i njohur" tone="success" /> : <StatusBadge label="Klient i ri" tone="info" />}
                      <br /><small className="adm-muted">{o.customer.phone}</small>
                    </td>
                    <td>{formatDate(o.delivery.date)}<br /><small className="adm-muted">{o.delivery.timeSlot} · {o.customer.city}</small></td>
                    <td>{o.type === 'custom' ? <StatusBadge label="E personalizuar" tone="sage" /> : <span className="adm-muted"><Icon name="bag" size={14} /> {o.items.reduce((s, i) => s + i.qty, 0)} artikuj</span>}</td>
                    <td><strong>{formatPrice(o.total)}</strong><br /><small className="adm-muted">{o.paymentStatus === 'paid' ? 'Paguar' : 'Cash – pa paguar'}</small></td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BlockedPhones />

      {open && <OrderDetail order={open} onClose={() => setOpenId(null)} onUpdated={onUpdated} onDeleted={onDeleted} />}
    </>
  );
}
