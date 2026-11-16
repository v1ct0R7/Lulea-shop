import { Router } from 'express';
import { config } from '../config.js';
import { createToken, requireAdmin, safeCompare } from '../middleware/auth.js';
import { HttpError } from '../utils/helpers.js';

const router = Router();

// Mbrojtje e thjeshtë kundër brute-force
const attempts = new Map();

router.post('/login', (req, res, next) => {
  const ip = req.ip;
  const rec = attempts.get(ip) || { count: 0, until: 0 };
  if (rec.until > Date.now()) return next(new HttpError(429, 'Shumë tentativa. Provoni pas pak minutash.'));

  const username = String(req.body?.username ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '').trim();
  const ok = safeCompare(username, config.adminUser.trim().toLowerCase()) & safeCompare(password, config.adminPassword.trim());
  if (!ok) {
    rec.count += 1;
    if (rec.count >= 5) Object.assign(rec, { count: 0, until: Date.now() + 5 * 60_000 });
    attempts.set(ip, rec);
    const left = 5 - rec.count;
    return next(new HttpError(401, rec.until > Date.now()
      ? 'Shumë tentativa të gabuara. Provoni pas 5 minutash.'
      : `Përdoruesi ose fjalëkalimi është i gabuar. Ju kanë mbetur ${left} tentativa.`));
  }
  attempts.delete(ip);
  res.json({ token: createToken(username), user: { username } });
  console.log(`🔐 Admin u kyç: ${username}`);
});

router.get('/me', requireAdmin, (req, res) => res.json({ user: { username: req.admin.sub } }));

export default router;
