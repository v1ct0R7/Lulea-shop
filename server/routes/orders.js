import { Router } from 'express';
import { db } from '../utils/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { HttpError, clean, newId } from '../utils/helpers.js';

const router = Router();

export const ORDER_STATUSES = ['new', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];

/* ---------- Mbrojtja nga porositë fake ---------- */

/** Normalizon numrin: 044123456, +383 44 123 456, 00383... → "38344123456" */
export function phoneKey(phone = '') {
  let d = String(phone).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `383${d.slice(1)}`; // numër lokal i Kosovës
  return d;
}

/** Pranon numra që duken realë: 8–15 shifra, pa shifra të përsëritura (p.sh. 000000000). */
export function isValidPhone(phone = '') {
  if (!/^[+\d\s()./-]+$/.test(phone)) return false;
  const d = phoneKey(phone);
  return d.length >= 8 && d.length <= 15 && !/^(\d)\1+$/.test(d.slice(3));
}

const LIMITS = {
  minFillMs: 4000, // një njeri s'e plotëson formularin për më pak se 4 sekonda
  perIpWindowMs: 60 * 60_000,
  perIpMax: 5, // max 5 porosi në orë nga e njëjta IP
  openPerPhoneMax: 3, // max 3 porosi të hapura (pa u dorëzuar) për numër
};
const ipLog = new Map();

function antiSpam(req, data) {
  const body = req.body || {};
  // Honeypot: fushë e fshehur që vetëm botët e plotësojnë
  if (body.website) throw new HttpError(400, 'Porosia nuk u pranua.');
  // Koha e plotësimit
  const started = Number(body.startedAt);
  if (!started || Date.now() - started < LIMITS.minFillMs) {
    throw new HttpError(400, 'Porosia u dërgua shumë shpejt. Ju lutem provoni përsëri.');
  }
  // Kufiri sipas IP-së
  const now = Date.now();
  const hits = (ipLog.get(req.ip) || []).filter((t) => now - t < LIMITS.perIpWindowMs);
  if (hits.length >= LIMITS.perIpMax) {
    throw new HttpError(429, 'Keni bërë shumë porosi për një kohë të shkurtër. Na telefononi për ndihmë.');
  }
  // Numër i bllokuar nga admini
  const key = phoneKey(body.customer?.phone);
  if ((data.blockedPhones || []).some((b) => b.phone === key)) {
    throw new HttpError(403, 'Nuk mund të pranojmë porosi online nga ky numër. Ju lutem na telefononi.');
  }
  // Shumë porosi të hapura me të njëjtin numër
  const open = data.orders.filter(
    (o) => o.phoneKey === key && !['delivered', 'cancelled'].includes(o.status)
  ).length;
  if (open >= LIMITS.openPerPhoneMax) {
    throw new HttpError(429, 'Ky numër ka tashmë disa porosi në pritje. Na telefononi për porosi të reja.');
  }
  hits.push(now);
  ipLog.set(req.ip, hits);
  return key;
}

/** Historiku i klientit sipas numrit – ndihmon adminin të dallojë klientët e dyshimtë. */
function customerHistory(orders, key, excludeId) {
  const list = orders.filter((o) => o.phoneKey === key && o.id !== excludeId);
  return {
    previous: list.length,
    delivered: list.filter((o) => o.status === 'delivered').length,
    cancelled: list.filter((o) => o.status === 'cancelled').length,
  };
}

/* ---------- Validimi i të dhënave të klientit për dërgesë ---------- */
function validateCustomer(body) {
  const c = body.customer || {};
  const customer = {
    fullName: clean(c.fullName, 80),
    phone: clean(c.phone, 30),
    email: clean(c.email, 120),
    city: clean(c.city, 60),
    address: clean(c.address, 200),
    notes: clean(c.notes, 500),
  };
  const recipient = body.recipient?.differentRecipient
    ? { fullName: clean(body.recipient.fullName, 80), phone: clean(body.recipient.phone, 30) }
    : null;
  const delivery = {
    date: clean(body.delivery?.date, 10),
    timeSlot: clean(body.delivery?.timeSlot, 30),
  };

  const errors = [];
  if (customer.fullName.length < 3) errors.push('Emri dhe mbiemri');
  if (!isValidPhone(customer.phone)) errors.push('Numri i telefonit (p.sh. 044 123 456)');
  if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) errors.push('Email-i');
  if (!customer.city) errors.push('Qyteti');
  if (customer.address.length < 5) errors.push('Adresa');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(delivery.date)) errors.push('Data e dërgesës');
  else {
    const today = new Date().toISOString().slice(0, 10);
    if (delivery.date < today) errors.push('Data e dërgesës (s’mund të jetë në të kaluarën)');
  }
  if (!delivery.timeSlot) errors.push('Orari i dërgesës');
  if (recipient && (!recipient.fullName || !isValidPhone(recipient.phone))) errors.push('Të dhënat e marrësit');
  if (errors.length) throw new HttpError(400, `Kontrolloni fushat: ${errors.join(', ')}.`);

  return { customer, recipient, delivery, cardMessage: clean(body.cardMessage, 300) };
}

/* ---------- Llogaritja e çmimeve në server (nuk i besohet klientit) ---------- */
function priceStandardItems(items, products) {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Shporta është bosh.');
  return items.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    if (!p) throw new HttpError(400, 'Një produkt në shportë nuk ekziston më.');
    if (!p.inStock) throw new HttpError(400, `“${p.name}” nuk është në stok.`);
    const qty = Math.min(Math.max(parseInt(it.qty, 10) || 1, 1), 50);
    return { productId: p.id, name: p.name, image: p.image, price: p.price, qty, lineTotal: p.price * qty };
  });
}

export function priceCustom(custom, options) {
  if (!custom || !Array.isArray(custom.flowers) || custom.flowers.length === 0) {
    throw new HttpError(400, 'Zgjidhni të paktën një lloj luleje.');
  }
  const flowers = custom.flowers.map((f) => {
    const opt = options.flowers.find((o) => o.id === f.id);
    if (!opt) throw new HttpError(400, 'Lloj luleje i pavlefshëm.');
    const qty = Math.min(Math.max(parseInt(f.qty, 10) || 0, 1), 101);
    const color = opt.colors.includes(f.color) ? f.color : opt.colors[0];
    return { id: opt.id, name: opt.name, color, qty, unitPrice: opt.price, lineTotal: opt.price * qty };
  });
  const style = options.styles.find((s) => s.id === custom.styleId) || options.styles[0];
  const wrapping = options.wrappings.find((w) => w.id === custom.wrappingId) || options.wrappings[0];
  const extras = options.extras.filter((e) => (custom.extraIds || []).includes(e.id));
  const flowersTotal = flowers.reduce((s, f) => s + f.lineTotal, 0);
  const subtotal =
    flowersTotal + style.price + wrapping.price + extras.reduce((s, e) => s + e.price, 0);
  return {
    flowers,
    style: { id: style.id, name: style.name, price: style.price },
    wrapping: { id: wrapping.id, name: wrapping.name, price: wrapping.price },
    extras: extras.map(({ id, name, price }) => ({ id, name, price })),
    colorTheme: clean(custom.colorTheme, 40),
    occasion: clean(custom.occasion, 40),
    instructions: clean(custom.instructions, 600),
    subtotal: Math.round(subtotal * 100) / 100,
  };
}

function nextOrderNumber(orders) {
  const year = new Date().getFullYear();
  const count = orders.filter((o) => o.number.startsWith(`LL-${year}`)).length + 1;
  return `LL-${year}-${String(count).padStart(4, '0')}`;
}

/* ---------- Publike: krijimi i porosisë (pagesë cash në dorëzim) ---------- */
router.post('/', (req, res) => {
  const order = db.update((data) => {
    data.blockedPhones ||= [];
    const key = antiSpam(req, data);
    const info = validateCustomer(req.body);
    const settings = data.settings;
    const type = req.body.type === 'custom' ? 'custom' : 'standard';

    let items = [];
    let custom = null;
    let subtotal;
    if (type === 'custom') {
      custom = priceCustom(req.body.custom, data.customOptions);
      subtotal = custom.subtotal;
    } else {
      items = priceStandardItems(req.body.items, data.products);
      subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    }
    const deliveryFee = subtotal >= settings.freeDeliveryFrom ? 0 : settings.deliveryFee;

    const o = {
      id: newId(),
      number: nextOrderNumber(data.orders),
      type,
      items,
      custom,
      ...info,
      phoneKey: key,
      ip: req.ip,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      total: Math.round((subtotal + deliveryFee) * 100) / 100,
      status: 'new',
      seen: false,
      history: [{ status: 'new', at: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    data.orders.unshift(o);
    return o;
  });
  console.log(`🌸 Porosi e re: ${order.number} – ${order.total} €`);
  res.status(201).json({ id: order.id, number: order.number, total: order.total });
});

/* ---------- Admin ---------- */
router.get('/', requireAdmin, (req, res) => {
  const { status, type, q } = req.query;
  let list = db.data.orders;
  if (status) list = list.filter((o) => o.status === status);
  if (type) list = list.filter((o) => o.type === type);
  if (q) {
    const t = String(q).toLowerCase();
    list = list.filter((o) =>
      `${o.number} ${o.customer.fullName} ${o.customer.phone}`.toLowerCase().includes(t)
    );
  }
  const all = db.data.orders;
  res.json(list.map((o) => ({ ...o, history_customer: customerHistory(all, o.phoneKey || phoneKey(o.customer.phone), o.id) })));
});

/* ---------- Numrat e bllokuar ---------- */
router.get('/blocked', requireAdmin, (_req, res) => res.json(db.data.blockedPhones || []));

router.post('/:id/block', requireAdmin, (req, res, next) => {
  const result = db.update((data) => {
    data.blockedPhones ||= [];
    const o = data.orders.find((x) => x.id === req.params.id);
    if (!o) return null;
    const key = o.phoneKey || phoneKey(o.customer.phone);
    if (!data.blockedPhones.some((b) => b.phone === key)) {
      data.blockedPhones.push({ phone: key, display: o.customer.phone, name: o.customer.fullName, reason: clean(req.body?.reason, 200) || 'Porosi fake', at: new Date().toISOString() });
    }
    if (o.status !== 'cancelled') {
      o.status = 'cancelled';
      o.history.push({ status: 'cancelled', at: new Date().toISOString() });
    }
    return o;
  });
  if (!result) return next(new HttpError(404, 'Porosia nuk u gjet.'));
  res.json(result);
});

router.delete('/blocked/:phone', requireAdmin, (req, res) => {
  db.update((data) => {
    data.blockedPhones = (data.blockedPhones || []).filter((b) => b.phone !== req.params.phone);
  });
  res.status(204).end();
});

router.get('/stats', requireAdmin, (_req, res) => {
  const { orders, products, categories } = db.data;
  const today = new Date().toISOString().slice(0, 10);
  const valid = orders.filter((o) => o.status !== 'cancelled');
  res.json({
    unseen: orders.filter((o) => !o.seen).length,
    newOrders: orders.filter((o) => o.status === 'new').length,
    todayOrders: orders.filter((o) => o.createdAt.startsWith(today)).length,
    todayDeliveries: valid.filter((o) => o.delivery.date === today && o.status !== 'delivered').length,
    revenue: valid.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
    pendingRevenue: valid.filter((o) => o.status !== 'delivered').reduce((s, o) => s + o.total, 0),
    totalOrders: orders.length,
    customOrders: orders.filter((o) => o.type === 'custom').length,
    products: products.length,
    categories: categories.length,
    latest: orders.slice(0, 5),
  });
});

router.patch('/:id', requireAdmin, (req, res, next) => {
  const result = db.update((data) => {
    const o = data.orders.find((x) => x.id === req.params.id);
    if (!o) return null;
    if (req.body.status !== undefined) {
      if (!ORDER_STATUSES.includes(req.body.status)) throw new HttpError(400, 'Status i pavlefshëm.');
      if (o.status !== req.body.status) {
        o.status = req.body.status;
        o.history.push({ status: o.status, at: new Date().toISOString() });
        if (o.status === 'delivered') o.paymentStatus = 'paid';
      }
    }
    if (req.body.paymentStatus !== undefined) {
      o.paymentStatus = req.body.paymentStatus === 'paid' ? 'paid' : 'unpaid';
    }
    if (req.body.adminNote !== undefined) o.adminNote = clean(req.body.adminNote, 500);
    if (req.body.seen !== undefined) o.seen = Boolean(req.body.seen);
    return { ...o, history_customer: customerHistory(data.orders, o.phoneKey || phoneKey(o.customer.phone), o.id) };
  });
  if (!result) return next(new HttpError(404, 'Porosia nuk u gjet.'));
  res.json(result);
});

router.delete('/:id', requireAdmin, (req, res, next) => {
  const removed = db.update((data) => {
    const i = data.orders.findIndex((o) => o.id === req.params.id);
    return i >= 0 ? data.orders.splice(i, 1)[0] : null;
  });
  if (!removed) return next(new HttpError(404, 'Porosia nuk u gjet.'));
  res.status(204).end();
});

export default router;
