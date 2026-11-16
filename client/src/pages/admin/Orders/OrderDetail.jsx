import { useEffect, useState } from 'react';
import { api } from '../../../api';
import { ORDER_STATUS, formatDate, formatPrice } from '../../../utils/format';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/ui/Icon/Icon';
import Modal from '../../../components/admin/Modal/Modal';
import StatusBadge from '../../../components/admin/StatusBadge/StatusBadge';
import styles from './OrderDetail.module.css';

/** Detajet e plota të një porosie + ndryshimi i statusit. */
export default function OrderDetail({ order: o, onClose, onUpdated, onDeleted }) {
  const [note, setNote] = useState(o.adminNote || '');
  const [busy, setBusy] = useState(false);

  // Shënoje si të parë sapo hapet
  useEffect(() => {
    if (!o.seen) api.updateOrder(o.id, { seen: true }).then(onUpdated).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.id]);

  const patch = async (data) => {
    setBusy(true);
    try {
      onUpdated(await api.updateOrder(o.id, data));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Të fshihet porosia ${o.number}?`)) return;
    await api.deleteOrder(o.id);
    onDeleted(o.id);
  };

  const block = async () => {
    const reason = prompt(`Bllokoni numrin ${o.customer.phone}? Porosia do të anulohet dhe ky numër s'do të mund të porosisë më online.\n\nArsyeja (opsionale):`, 'Porosi fake');
    if (reason === null) return;
    patchWith(() => api.blockOrderPhone(o.id, reason));
  };
  const patchWith = async (fn) => {
    setBusy(true);
    try { onUpdated({ ...(await fn()), history_customer: o.history_customer }); } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  const h = o.history_customer || { previous: 0, delivered: 0, cancelled: 0 };
  const risk = h.cancelled > 0 ? 'danger' : h.delivered > 0 ? 'trusted' : 'new';

  const c = o.custom;
  const tel = o.customer.phone.replace(/[^\d+]/g, '');

  return (
    <Modal open wide onClose={onClose} title={`Porosia ${o.number}`}
      footer={
        <>
          <Button variant="danger" size="sm" onClick={remove} style={{ marginRight: 'auto' }}><Icon name="trash" size={15} /> Fshi</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>Printo</Button>
          <Button size="sm" onClick={onClose}>Mbyll</Button>
        </>
      }>
      <div className={styles.wrap}>
        <div className={styles.statusBar}>
          <div>
            <StatusBadge status={o.status} /> <span className="adm-muted">· krijuar {formatDate(o.createdAt, true)}</span>
          </div>
          <div className={styles.statusBtns}>
            {Object.entries(ORDER_STATUS).map(([k, v]) => (
              <button key={k} disabled={busy} className={o.status === k ? styles.on : ''} onClick={() => patch({ status: k })}>{v.label}</button>
            ))}
          </div>
        </div>

        <div className={`${styles.trust} ${styles[risk]}`}>
          <Icon name={risk === 'danger' ? 'bell' : risk === 'trusted' ? 'check' : 'phone'} size={18} />
          <div>
            {risk === 'new' && <><strong>Klient i ri.</strong> Telefonojeni për ta konfirmuar porosinë para se ta përgatitni.</>}
            {risk === 'trusted' && <><strong>Klient i besueshëm.</strong> {h.delivered} porosi të dorëzuara më parë.</>}
            {risk === 'danger' && <><strong>Kujdes!</strong> Ky numër ka {h.cancelled} porosi të anuluara{h.delivered ? ` dhe ${h.delivered} të dorëzuara` : ''}. Konfirmojeni patjetër me telefon.</>}
          </div>
          <Button size="sm" variant="danger" onClick={block} disabled={busy}>Blloko numrin</Button>
        </div>

        <div className={styles.cols}>
          <section>
            <h3>Klienti</h3>
            <dl>
              <dt>Emri</dt><dd>{o.customer.fullName}</dd>
              <dt>Telefoni</dt><dd><a href={`tel:${tel}`}>{o.customer.phone}</a> · <a href={`https://wa.me/${tel.replace('+', '')}`} target="_blank" rel="noreferrer">WhatsApp</a></dd>
              {o.customer.email && (<><dt>Email</dt><dd><a href={`mailto:${o.customer.email}`}>{o.customer.email}</a></dd></>)}
            </dl>
            {o.recipient && (
              <>
                <h3>Marrësi (dhuratë)</h3>
                <dl><dt>Emri</dt><dd>{o.recipient.fullName}</dd><dt>Telefoni</dt><dd><a href={`tel:${o.recipient.phone}`}>{o.recipient.phone}</a></dd></dl>
              </>
            )}
          </section>
          <section>
            <h3>Dërgesa</h3>
            <dl>
              <dt>Adresa</dt><dd>{o.customer.address}, {o.customer.city}</dd>
              <dt>Data</dt><dd>{formatDate(o.delivery.date)} · {o.delivery.timeSlot}</dd>
              {o.customer.notes && (<><dt>Shënime</dt><dd>{o.customer.notes}</dd></>)}
            </dl>
            {o.cardMessage && (<><h3>Mesazhi në kartolinë</h3><blockquote className={styles.card}>“{o.cardMessage}”</blockquote></>)}
          </section>
        </div>

        <section>
          <h3>{o.type === 'custom' ? 'Buqeta e personalizuar' : 'Produktet'}</h3>
          <table className={`adm-table ${styles.items}`}>
            <tbody>
              {o.type === 'standard' && o.items.map((i) => (
                <tr key={i.productId}><td>{i.qty} × {i.name}</td><td>{formatPrice(i.lineTotal)}</td></tr>
              ))}
              {c && (
                <>
                  {c.flowers.map((f) => (<tr key={f.id}><td>{f.qty} × {f.name} – <em>{f.color}</em></td><td>{formatPrice(f.lineTotal)}</td></tr>))}
                  <tr><td>Stili: {c.style.name}</td><td>{formatPrice(c.style.price)}</td></tr>
                  <tr><td>Mbështjellësi: {c.wrapping.name}</td><td>{formatPrice(c.wrapping.price)}</td></tr>
                  {c.extras.map((e) => (<tr key={e.id}><td>+ {e.name}</td><td>{formatPrice(e.price)}</td></tr>))}
                </>
              )}
              <tr><td className="adm-muted">Nëntotali</td><td>{formatPrice(o.subtotal)}</td></tr>
              <tr><td className="adm-muted">Dërgesa</td><td>{o.deliveryFee ? formatPrice(o.deliveryFee) : 'Falas'}</td></tr>
              <tr className={styles.total}><td>Totali (cash)</td><td>{formatPrice(o.total)}</td></tr>
            </tbody>
          </table>
          {c && (c.occasion || c.colorTheme || c.instructions) && (
            <dl className={styles.extra}>
              {c.occasion && (<><dt>Rasti</dt><dd>{c.occasion}</dd></>)}
              {c.colorTheme && (<><dt>Tema e ngjyrave</dt><dd>{c.colorTheme}</dd></>)}
              {c.instructions && (<><dt>Udhëzime</dt><dd>{c.instructions}</dd></>)}
            </dl>
          )}
        </section>

        <div className={styles.cols}>
          <section>
            <h3>Pagesa</h3>
            <label className="adm-switch">
              <input type="checkbox" checked={o.paymentStatus === 'paid'} onChange={(e) => patch({ paymentStatus: e.target.checked ? 'paid' : 'unpaid' })} />
              {o.paymentStatus === 'paid' ? 'Paguar (cash)' : 'Pa paguar – arkëtohet në dorëzim'}
            </label>
          </section>
          <section>
            <h3>Shënim i brendshëm</h3>
            <div className={styles.note}>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Vetëm për stafin…" />
              <Button size="sm" variant="outline" disabled={busy || note === (o.adminNote || '')} onClick={() => patch({ adminNote: note })}>Ruaj</Button>
            </div>
          </section>
        </div>

        <section>
          <h3>Historiku</h3>
          <ul className={styles.history}>
            {o.history.map((h, i) => <li key={i}><StatusBadge status={h.status} /> {formatDate(h.at, true)}</li>)}
          </ul>
        </section>
      </div>
    </Modal>
  );
}
