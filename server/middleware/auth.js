import crypto from 'node:crypto';
import { config } from '../config.js';
import { HttpError } from '../utils/helpers.js';

const sign = (data) =>
  crypto.createHmac('sha256', config.tokenSecret).update(data).digest('base64url');

export function createToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ sub: username, exp: Date.now() + config.tokenTtlHours * 3600_000 })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export function requireAdmin(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = verifyToken(token);
  if (!user) return next(new HttpError(401, 'Nuk jeni i autorizuar.'));
  req.admin = user;
  next();
}

export function safeCompare(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
