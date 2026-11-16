import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api';
import { useFetch } from '../../../hooks/useFetch';
import { formatDate, formatPrice } from '../../../utils/format';
import Icon from '../../../components/ui/Icon/Icon';
import Spinner from '../../../components/ui/Spinner/Spinner';
import Button from '../../../components/ui/Button/Button';
import StatusBadge from '../../../components/admin/StatusBadge/StatusBadge';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { data: s, loading, reload } = useFetch(() => api.getOrderStats(), []);
  useEffect(() => {
    window.addEventListener('lulea:new-order', reload);
    return () => window.removeEventListener('lulea:new-order', reload);
  }, [reload]);

  if (loading || !s) return <Spinner />;

  const cards = [
    { label: 'Porosi të reja', value: s.newOrders, icon: 'bell', tone: 'warn', to: '/admin/porosite?status=new' },
    { label: 'Dërgesa sot', value: s.todayDeliveries, icon: 'truck', tone: 'info', to: '/admin/porosite' },
    { label: 'Të ardhura (dorëzuar)', value: formatPrice(s.revenue), icon: 'cash', tone: 'success' },
    { label: 'Në pritje për t’u arkëtuar', value: formatPrice(s.pendingRevenue), icon: 'clock', tone: 'mocha' },
  ];

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Mirë se vini 🌸</h1>
          <p>Përmbledhja e dyqanit për sot, {formatDate(new Date().toISOString())}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button to="/admin/produktet?shto=1" size="sm"><Icon name="plus" size={16} /> Produkt i ri</Button>
          <Button to="/admin/kategorite?shto=1" size="sm" variant="outline"><Icon name="plus" size={16} /> Kategori</Button>
        </div>
      </div>

      <div className={styles.stats}>
        {cards.map((c) => {
          const Inner = (
            <>
              <span className={`${styles.icon} ${styles[c.tone]}`}><Icon name={c.icon} /></span>
              <div><small>{c.label}</small><strong>{c.value}</strong></div>
            </>
          );
          return c.to ? <Link key={c.label} to={c.to} className={`adm-card ${styles.stat}`}>{Inner}</Link> : <div key={c.label} className={`adm-card ${styles.stat}`}>{Inner}</div>;
        })}
      </div>

      <div className={styles.grid}>
        <section className="adm-card">
          <header className={styles.cardHead}>
            <h2>Porositë e fundit</h2>
            <Link to="/admin/porosite">Shiko të gjitha →</Link>
          </header>
          {s.latest.length === 0 ? (
            <p className="adm-empty">Ende nuk ka porosi. Ato do të shfaqen këtu automatikisht.</p>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <tbody>
                  {s.latest.map((o) => (
                    <tr key={o.id}>
                      <td><strong>{o.number}</strong><br /><small className="adm-muted">{formatDate(o.createdAt, true)}</small></td>
                      <td>{o.customer.fullName}<br /><small className="adm-muted">{o.type === 'custom' ? 'E personalizuar' : `${o.items.length} artikuj`}</small></td>
                      <td>{formatPrice(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={`adm-card adm-pad ${styles.summary}`}>
          <h2>Dyqani</h2>
          <ul>
            <li><span>Porosi gjithsej</span><strong>{s.totalOrders}</strong></li>
            <li><span>Porosi të personalizuara</span><strong>{s.customOrders}</strong></li>
            <li><span>Porosi sot</span><strong>{s.todayOrders}</strong></li>
            <li><span>Produkte</span><strong>{s.products}</strong></li>
            <li><span>Kategori</span><strong>{s.categories}</strong></li>
          </ul>
        </section>
      </div>
    </>
  );
}
