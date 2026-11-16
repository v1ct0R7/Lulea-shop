import { Router } from 'express';
import { db } from '../utils/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { HttpError } from '../utils/helpers.js';

const router = Router();

/** Opsionet për porosinë e personalizuar + cilësimet publike */
router.get('/custom-options', (_req, res) => res.json(db.data.customOptions));
router.get('/settings', (_req, res) => res.json(db.data.settings));

router.post('/uploads', requireAdmin, upload.single('image'), (req, res, next) => {
  if (!req.file) return next(new HttpError(400, 'Nuk u ngarkua asnjë imazh.'));
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default router;
