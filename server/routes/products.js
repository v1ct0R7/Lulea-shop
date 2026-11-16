import { Router } from 'express';
import { db } from '../utils/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { HttpError, clean, newId, uniqueSlug } from '../utils/helpers.js';

const router = Router();

function enrich(p, categories) {
  const cat = categories.find((c) => c.id === p.categoryId);
  const type = cat?.types.find((t) => t.id === p.typeId);
  return {
    ...p,
    category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
    type: type || null,
  };
}

function validate(body, data, partial = false) {
  const out = {};
  if (!partial || body.name !== undefined) {
    out.name = clean(body.name, 100);
    if (!out.name) throw new HttpError(400, 'Emri i produktit është i detyrueshëm.');
  }
  if (!partial || body.price !== undefined) {
    out.price = Math.round(Number(body.price) * 100) / 100;
    if (!(out.price > 0)) throw new HttpError(400, 'Çmimi duhet të jetë më i madh se 0.');
  }
  if (body.oldPrice !== undefined) {
    const op = Number(body.oldPrice);
    out.oldPrice = op > 0 ? Math.round(op * 100) / 100 : null;
  }
  if (!partial || body.categoryId !== undefined) {
    const cat = data.categories.find((c) => c.id === body.categoryId);
    if (!cat) throw new HttpError(400, 'Zgjidhni një kategori të vlefshme.');
    out.categoryId = cat.id;
    out.typeId = cat.types.some((t) => t.id === body.typeId) ? body.typeId : null;
  } else if (body.typeId !== undefined) {
    out.typeId = body.typeId || null;
  }
  if (body.description !== undefined) out.description = clean(body.description, 2000);
  if (body.image !== undefined) out.image = clean(body.image, 300);
  if (body.featured !== undefined) out.featured = Boolean(body.featured);
  if (body.inStock !== undefined) out.inStock = Boolean(body.inStock);
  return out;
}

router.get('/', (req, res) => {
  const { products, categories } = db.data;
  const { category, type, featured, q, sort, limit, exclude } = req.query;
  let list = [...products];

  if (category) {
    const cat = categories.find((c) => c.slug === category || c.id === category);
    list = cat ? list.filter((p) => p.categoryId === cat.id) : [];
  }
  if (type) list = list.filter((p) => p.typeId === type);
  if (featured === 'true') list = list.filter((p) => p.featured);
  if (exclude) list = list.filter((p) => p.id !== exclude);
  if (q) {
    const term = String(q).toLowerCase();
    list = list.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(term));
  }

  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    name: (a, b) => a.name.localeCompare(b.name, 'sq'),
  };
  list.sort(sorters[sort] || sorters.newest);
  if (limit) list = list.slice(0, Number(limit));

  res.json(list.map((p) => enrich(p, categories)));
});

router.get('/:slug', (req, res, next) => {
  const { products, categories } = db.data;
  const p = products.find((x) => x.slug === req.params.slug || x.id === req.params.slug);
  if (!p) return next(new HttpError(404, 'Produkti nuk u gjet.'));
  res.json(enrich(p, categories));
});

router.post('/', requireAdmin, (req, res) => {
  const product = db.update((data) => {
    const fields = validate(req.body, data);
    const p = {
      id: newId(),
      slug: uniqueSlug(fields.name, data.products),
      description: '',
      image: '',
      oldPrice: null,
      featured: false,
      inStock: true,
      ...fields,
      createdAt: new Date().toISOString(),
    };
    data.products.push(p);
    return enrich(p, data.categories);
  });
  res.status(201).json(product);
});

router.put('/:id', requireAdmin, (req, res, next) => {
  const result = db.update((data) => {
    const p = data.products.find((x) => x.id === req.params.id);
    if (!p) return null;
    const fields = validate(req.body, data, true);
    Object.assign(p, fields, { updatedAt: new Date().toISOString() });
    if (fields.name) p.slug = uniqueSlug(fields.name, data.products, p.id);
    return enrich(p, data.categories);
  });
  if (!result) return next(new HttpError(404, 'Produkti nuk u gjet.'));
  res.json(result);
});

router.delete('/:id', requireAdmin, (req, res, next) => {
  const removed = db.update((data) => {
    const i = data.products.findIndex((p) => p.id === req.params.id);
    return i >= 0 ? data.products.splice(i, 1)[0] : null;
  });
  if (!removed) return next(new HttpError(404, 'Produkti nuk u gjet.'));
  res.status(204).end();
});

export default router;
