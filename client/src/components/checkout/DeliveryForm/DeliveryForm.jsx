import { useEffect, useState } from 'react';
import { api } from '../../../api';
import { useShop } from '../../../context/ShopContext';
import { todayISO } from '../../../utils/format';
import Icon from '../../ui/Icon/Icon';
import styles from './DeliveryForm.module.css';

export const emptyDelivery = () => ({
  customer: { fullName: '', phone: '', email: '', city: '', address: '', notes: '' },
  recipient: { differentRecipient: false, fullName: '', phone: '' },
  delivery: { date: todayISO(), timeSlot: '' },
  cardMessage: '',
  website: '', // honeypot kundër botëve – duhet të mbetet bosh
  startedAt: Date.now(), // koha kur u hap formulari
});

/**
 * Formulari i të dhënave për dërgesë – përdoret në Checkout dhe në Porosinë e Personalizuar.
 * Kontrollohet nga prindi përmes `value` dhe `onChange`.
 */
export default function DeliveryForm({ value, onChange }) {
  const { settings } = useShop();
  const [slots, setSlots] = useState([]);
  useEffect(() => {
    api.getCustomOptions().then((o) => setSlots(o.timeSlots)).catch(() => {});
  }, []);

  const set = (group, field) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(group ? { ...value, [group]: { ...value[group], [field]: v } } : { ...value, [field]: v });
  };

  const { customer, recipient, delivery } = value;

  return (
    <div className={styles.form}>
      {/* Fushë e fshehur: njerëzit s'e shohin, botët e plotësojnë → porosia refuzohet */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
        value={value.website || ''} onChange={set(null, 'website')}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <fieldset className={styles.block}>
        <legend><span>1</span> Të dhënat tuaja</legend>
        <div className="form-grid two">
          <div className="field">
            <label htmlFor="fullName">Emri dhe mbiemri *</label>
            <input id="fullName" className="input" required autoComplete="name" value={customer.fullName} onChange={set('customer', 'fullName')} />
          </div>
          <div className="field">
            <label htmlFor="phone">Telefoni *</label>
            <input id="phone" className="input" required type="tel" autoComplete="tel" placeholder="+383 44 123 456" value={customer.phone} onChange={set('customer', 'phone')} />
          </div>
          <div className="field span-2">
            <label htmlFor="email">Email (opsional)</label>
            <input id="email" className="input" type="email" autoComplete="email" value={customer.email} onChange={set('customer', 'email')} />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.block}>
        <legend><span>2</span> Adresa e dërgesës</legend>
        <div className="form-grid two">
          <div className="field">
            <label htmlFor="city">Qyteti *</label>
            <select id="city" className="select" required value={customer.city} onChange={set('customer', 'city')}>
              <option value="">Zgjidhni qytetin</option>
              {settings?.cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="address">Adresa e plotë *</label>
            <input id="address" className="input" required autoComplete="street-address" placeholder="Rruga, nr., hyrja, kati" value={customer.address} onChange={set('customer', 'address')} />
          </div>
          <div className="field">
            <label htmlFor="date">Data e dërgesës *</label>
            <input id="date" className="input" type="date" required min={todayISO()} value={delivery.date} onChange={set('delivery', 'date')} />
          </div>
          <div className="field">
            <label htmlFor="slot">Orari *</label>
            <select id="slot" className="select" required value={delivery.timeSlot} onChange={set('delivery', 'timeSlot')}>
              <option value="">Zgjidhni orarin</option>
              {slots.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field span-2">
            <label className="checkbox">
              <input type="checkbox" checked={recipient.differentRecipient} onChange={set('recipient', 'differentRecipient')} />
              Lulet janë dhuratë për dikë tjetër
            </label>
          </div>
          {recipient.differentRecipient && (
            <>
              <div className="field">
                <label htmlFor="rName">Emri i marrësit *</label>
                <input id="rName" className="input" required value={recipient.fullName} onChange={set('recipient', 'fullName')} />
              </div>
              <div className="field">
                <label htmlFor="rPhone">Telefoni i marrësit *</label>
                <input id="rPhone" className="input" required type="tel" value={recipient.phone} onChange={set('recipient', 'phone')} />
              </div>
            </>
          )}
          <div className="field span-2">
            <label htmlFor="card">Mesazh në kartolinë (opsional)</label>
            <textarea id="card" className="textarea" maxLength={300} rows={3} placeholder="P.sh. Gëzuar ditëlindjen, me shumë dashuri!" value={value.cardMessage} onChange={set(null, 'cardMessage')} />
            <span className="hint">{value.cardMessage.length}/300 – e shkruajmë me dorë në një kartolinë elegante.</span>
          </div>
          <div className="field span-2">
            <label htmlFor="notes">Shënime për korrierin</label>
            <input id="notes" className="input" placeholder="P.sh. telefononi para se të vini" value={customer.notes} onChange={set('customer', 'notes')} />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.block}>
        <legend><span>3</span> Mënyra e pagesës</legend>
        <label className={styles.payOption}>
          <input type="radio" name="payment" checked readOnly />
          <Icon name="cash" size={26} />
          <div>
            <strong>Para në dorë (Cash)</strong>
            <small>Paguani korrierit kur t’i merrni lulet. Pa pagesë paraprake.</small>
          </div>
        </label>
      </fieldset>
    </div>
  );
}
