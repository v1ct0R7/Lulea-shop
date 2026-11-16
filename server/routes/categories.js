import { Router } from 'express';
import { db } from '../utils/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { HttpError, clean, newId, uniqueSlug } from '../utils/helpers.js';

const router = Router();

const withCounts = (cat, products) => ({
  ...cat,
  productCount: products.filter((p) => p.categoryId === cat.id).length,
});

function parseTypes(types = []) {
  if (!Array.isArray(types)) return [];
  return types
    .map((t) => (typeof t === 'string' ? { name: t } : t))
    .filter((t) => clean(t?.name))
    .map((t) => ({ id: t.id || newId(), name: clean(t.name, 60) }));
}

router.get('/', (_req, res) => {
  const { categories, products } = db.data;
  res.json([...categories].sort((a, b) => a.order - b.order).map((c) => withCounts(c, products)));
});

router.get('/:slug', (req, res, next) => {
  const cat = db.data.categories.find((c) => c.slug === req.params.slug || c.id === req.params.slug);
  if (!cat) return next(new HttpError(404, 'Kategoria nuk u gjet.'));
  res.json(withCounts(cat, db.data.products));
});

router.post('/', requireAdmin, (req, res, next) => {
  const name = clean(req.body.name, 80);
  if (!name) return next(new HttpError(400, 'Emri i kategorisë është i detyrueshëm.'));
  const cat = db.update((data) => {
    const c = {
      id: newId(),
      slug: uniqueSlug(name, data.categories),
      name,
      description: clean(req.body.description, 400),
      image: clean(req.body.image, 300),
      accent: clean(req.body.accent, 20) || '#c9a9a6',
      types: parseTypes(req.body.types),
      order: data.categories.length + 1,
    };
    data.categories.push(c);
    return c;
  });
  res.status(201).json(cat);
});

router.put('/:id', requireAdmin, (req, res, next) => {
  const result = db.update((data) => {
    const c = data.categories.find((x) => x.id === req.params.id);
    if (!c) return null;
    if (req.body.name !== undefined) {
      c.name = clean(req.body.name, 80) || c.name;
      c.slug = uniqueSlug(c.name, data.categories, c.id);
    }
    if (req.body.description !== undefined) c.description = clean(req.body.description, 400);
    if (req.body.image !== undefined) c.image = clean(req.body.image, 300);
    if (req.body.accent !== undefined) c.accent = clean(req.body.accent, 20);
    if (req.body.types !== undefined) {
      c.types = parseTypes(req.body.types);
      // produktet me lloj të fshirë mbeten pa lloj
      const ids = new Set(c.types.map((t) => t.id));
      data.products.forEach((p) => {
        if (p.categoryId === c.id && p.typeId && !ids.has(p.typeId)) p.typeId = null;
      });
    }
    return c;
  });
  if (!result) return next(new HttpError(404, 'Kategoria nuk u gjet.'));
  res.json(result);
});

router.delete('/:id', requireAdmin, (req, res, next) => {
  const { products } = db.data;
  if (products.some((p) => p.categoryId === req.params.id)) {
    return next(new HttpError(409, 'Kjo kategori ka produkte. Fshijini ose zhvendosini ato më parë.'));
  }
  const removed = db.update((data) => {
    const i = data.categories.findIndex((c) => c.id === req.params.id);
    return i >= 0 ? data.categories.splice(i, 1)[0] : null;
  });
  if (!removed) return next(new HttpError(404, 'Kategoria nuk u gjet.'));
  res.status(204).end();
});

export default router;
