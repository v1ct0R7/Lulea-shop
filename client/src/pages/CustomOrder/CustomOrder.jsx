import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { formatPrice } from '../../utils/format';
import Seo from '../../components/ui/Seo/Seo';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Button from '../../components/ui/Button/Button';
import Icon from '../../components/ui/Icon/Icon';
import Spinner from '../../components/ui/Spinner/Spinner';
import QuantityInput from '../../components/ui/QuantityInput/QuantityInput';
import DeliveryForm, { emptyDelivery } from '../../components/checkout/DeliveryForm/DeliveryForm';
import OrderSummary from '../../components/cart/OrderSummary/OrderSummary';
import styles from './CustomOrder.module.css';

const STEPS = ['Lulet', 'Stili & detajet', 'Dërgesa'];

const COLOR_HEX = {
  'E kuqe': '#b8343f', 'E bardhë': '#f7f3ee', 'Rozë': '#eba7b5', 'E verdhë': '#f2cf5b',
  Portokalli: '#ec9150', Vjollcë: '#9277b5', Koral: '#f08a77', Blu: '#7f9fd0',
};

export default function CustomOrder() {
  const navigate = useNavigate();
  const { data: opt, loading } = useFetch(() => api.getCustomOptions(), []);
  const [step, setStep] = useState(0);
  const [flowers, setFlowers] = useState([]); // [{ id, color, qty }]
  const [details, setDetails] = useState({ styleId: 'classic', wrappingId: 'kraft', extraIds: [], colorTheme: '', occasion: '', instructions: '' });
  const [delivery, setDelivery] = useState(emptyDelivery);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const price = useMemo(() => {
    if (!opt) return { subtotal: 0, lines: [] };
    const lines = flowers.map((f) => {
      const o = opt.flowers.find((x) => x.id === f.id);
      return { label: `${f.qty} × ${o.name} (${f.color})`, value: formatPrice(o.price * f.qty), amount: o.price * f.qty };
    });
    const style = opt.styles.find((s) => s.id === details.styleId);
    const wrap = opt.wrappings.find((w) => w.id === details.wrappingId);
    if (style?.price) lines.push({ label: style.name, value: formatPrice(style.price), amount: style.price });
    if (wrap?.price) lines.push({ label: `Mbështjellës: ${wrap.name}`, value: formatPrice(wrap.price), amount: wrap.price });
    opt.extras.filter((e) => details.extraIds.includes(e.id)).forEach((e) => lines.push({ label: e.name, value: formatPrice(e.price), amount: e.price }));
    return { subtotal: lines.reduce((s, l) => s + l.amount, 0), lines };
  }, [opt, flowers, details]);

  if (loading || !opt) return <Spinner />;

  const stems = flowers.reduce((s, f) => s + f.qty, 0);
  const toggleFlower = (o) =>
    setFlowers((list) => (list.some((f) => f.id === o.id) ? list.filter((f) => f.id !== o.id) : [...list, { id: o.id, color: o.colors[0], qty: 5 }]));
  const patchFlower = (id, patch) => setFlowers((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const setD = (k, v) => setDetails((d) => ({ ...d, [k]: v }));
  const toggleExtra = (id) => setD('extraIds', details.extraIds.includes(id) ? details.extraIds.filter((x) => x !== id) : [...details.extraIds, id]);

  const next = () => {
    setError('');
    if (step === 0 && flowers.length === 0) return setError('Zgjidhni të paktën një lloj luleje.');
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (step < 2) return next();
    setError('');
    setSending(true);
    try {
      const order = await api.createOrder({ type: 'custom', custom: { flowers, ...details }, ...delivery });
      navigate('/porosia/sukses', { replace: true, state: { order, name: delivery.customer.fullName } });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <>
      <Seo
        title="Krijo Buqetën Tënde – Porosi e Personalizuar"
        description="Krijoni buqetën tuaj: zgjidhni lulet, ngjyrat, sasinë, stilin dhe mbështjellësin. Çmim në kohë reale, dërgesë në shtëpi dhe pagesë cash."
      />
      <PageHeader
        crumbs={[{ name: 'Ballina', path: '/' }, { name: 'Krijo buqetën', path: '/porosi-e-personalizuar' }]}
        eyebrow="Porosi e personalizuar"
        title="Krijo buqetën tënde"
        text="Ju zgjidhni çdo detaj – floristët tanë e kthejnë në art."
      />

      <div className="container">
        <ol className={styles.stepper}>
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? styles.current : i < step ? styles.done : ''}>
              <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step}>
                <span>{i < step ? <Icon name="check" size={14} stroke={2.4} /> : i + 1}</span>{s}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <form className={`container ${styles.grid}`} onSubmit={submit}>
        <div>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          {step === 0 && (
            <section className={styles.panel}>
              <h2>Zgjidhni lulet</h2>
              <p className={styles.lead}>Klikoni mbi lulet që dëshironi, pastaj zgjidhni ngjyrën dhe sasinë.</p>
              <div className={styles.flowers}>
                {opt.flowers.map((o) => {
                  const sel = flowers.find((f) => f.id === o.id);
                  return (
                    <div key={o.id} className={`${styles.flower} ${sel ? styles.sel : ''}`}>
                      <button type="button" className={styles.flowerHead} onClick={() => toggleFlower(o)} aria-pressed={!!sel}>
                        <span className={styles.tick}>{sel && <Icon name="check" size={14} stroke={2.4} />}</span>
                        <strong>{o.name}</strong>
                        <small>{formatPrice(o.price)} / kërcell</small>
                      </button>
                      {sel && (
                        <div className={styles.flowerOpts}>
                          <div className={styles.swatches} role="radiogroup" aria-label={`Ngjyra e ${o.name}`}>
                            {o.colors.map((c) => (
                              <button key={c} type="button" role="radio" aria-checked={sel.color === c} title={c}
                                className={sel.color === c ? styles.swOn : ''} style={{ '--sw': COLOR_HEX[c] || '#ccc' }}
                                onClick={() => patchFlower(o.id, { color: c })}>
                                <span className="visually-hidden">{c}</span>
                              </button>
                            ))}
                          </div>
                          <span className={styles.colorName}>{sel.color}</span>
                          <QuantityInput small value={sel.qty} max={101} onChange={(q) => patchFlower(o.id, { qty: q })} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {stems > 0 && <p className={styles.stems}><Icon name="flower" size={18} /> Gjithsej {stems} lule në buqetë</p>}
            </section>
          )}

          {step === 1 && (
            <section className={styles.panel}>
              <h2>Stili i buqetës</h2>
              <div className={styles.options}>
                {opt.styles.map((s) => (
                  <label key={s.id} className={`${styles.option} ${details.styleId === s.id ? styles.optOn : ''}`}>
                    <input type="radio" name="style" checked={details.styleId === s.id} onChange={() => setD('styleId', s.id)} />
                    <strong>{s.name}</strong>
                    <small>{s.description}</small>
                    <em>{s.price ? `+ ${formatPrice(s.price)}` : 'Përfshirë'}</em>
                  </label>
                ))}
              </div>

              <h3 className={styles.sub}>Mbështjellësi</h3>
              <div className={styles.pills}>
                {opt.wrappings.map((w) => (
                  <button type="button" key={w.id} className={details.wrappingId === w.id ? styles.pillOn : ''} onClick={() => setD('wrappingId', w.id)}>
                    {w.name} {w.price ? <small>+{formatPrice(w.price)}</small> : null}
                  </button>
                ))}
              </div>

              <h3 className={styles.sub}>Shtesa</h3>
              <div className={styles.pills}>
                {opt.extras.map((x) => (
                  <button type="button" key={x.id} className={details.extraIds.includes(x.id) ? styles.pillOn : ''} onClick={() => toggleExtra(x.id)} aria-pressed={details.extraIds.includes(x.id)}>
                    {details.extraIds.includes(x.id) && <Icon name="check" size={14} />} {x.name} <small>+{formatPrice(x.price)}</small>
                  </button>
                ))}
              </div>

              <div className="form-grid two" style={{ marginTop: 28 }}>
                <div className="field">
                  <label htmlFor="occ">Rasti</label>
                  <select id="occ" className="select" value={details.occasion} onChange={(e) => setD('occasion', e.target.value)}>
                    <option value="">Zgjidhni rastin</option>
                    {opt.occasions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="theme">Tema e ngjyrave</label>
                  <select id="theme" className="select" value={details.colorTheme} onChange={(e) => setD('colorTheme', e.target.value)}>
                    <option value="">Sipas zgjedhjes sime</option>
                    {opt.colorThemes.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="field span-2">
                  <label htmlFor="instr">Udhëzime për floristin</label>
                  <textarea id="instr" className="textarea" maxLength={600} placeholder="P.sh. pa lule me erë të fortë, stil i lartë, ngjyra të buta…" value={details.instructions} onChange={(e) => setD('instructions', e.target.value)} />
                </div>
              </div>
            </section>
          )}

          {step === 2 && <DeliveryForm value={delivery} onChange={setDelivery} />}

          <div className={styles.nav}>
            {step > 0 ? <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>← Kthehu</Button> : <span />}
            {step < 2 ? (
              <Button type="submit">Vazhdo →</Button>
            ) : (
              <Button type="submit" loading={sending}>Dërgo porosinë</Button>
            )}
          </div>
        </div>

        <OrderSummary title="Buqeta juaj" lines={price.lines} subtotal={price.subtotal}>
          {price.lines.length === 0 && <p className={styles.emptySum}>Zgjidhni lulet për të parë çmimin.</p>}
        </OrderSummary>
      </form>
    </>
  );
}
