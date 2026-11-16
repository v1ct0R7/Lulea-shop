const money = new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
export const formatPrice = (n) => money.format(Number(n) || 0);

export const formatDate = (iso, withTime = false) => {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  if (withTime) Object.assign(opts, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleString('sq-AL', opts);
};

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const ORDER_STATUS = {
  new: { label: 'E re', tone: 'warn' },
  confirmed: { label: 'Konfirmuar', tone: 'info' },
  preparing: { label: 'Në përgatitje', tone: 'info' },
  delivering: { label: 'Në dërgesë', tone: 'mocha' },
  delivered: { label: 'Dorëzuar', tone: 'success' },
  cancelled: { label: 'Anuluar', tone: 'danger' },
};
