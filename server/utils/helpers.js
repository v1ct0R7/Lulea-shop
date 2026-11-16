import crypto from 'node:crypto';

export const newId = () => crypto.randomUUID();

export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ë/g, 'e')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Krijon slug unik brenda një liste. */
export function uniqueSlug(text, list, ignoreId) {
  const base = slugify(text) || 'item';
  let slug = base;
  let i = 2;
  while (list.some((x) => x.slug === slug && x.id !== ignoreId)) slug = `${base}-${i++}`;
  return slug;
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);
