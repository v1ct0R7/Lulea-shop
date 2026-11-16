import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import metaRoutes from './routes/meta.js';
import seoRoutes from './routes/seo.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '200kb' }));

app.use('/uploads', express.static(config.paths.uploads, { maxAge: '30d' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', metaRoutes);
app.use('/api', notFound);
app.use(seoRoutes);

// Në prodhim, serveri shërben edhe aplikacionin React të ndërtuar
if (fs.existsSync(config.paths.clientDist)) {
  app.use(express.static(config.paths.clientDist, { index: false, maxAge: '7d' }));
  app.get('*', (_req, res) => res.sendFile(path.join(config.paths.clientDist, 'index.html')));
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🌷 Lulea API po punon në http://localhost:${config.port}`);
  console.log(`🔑 Admin: përdoruesi "${config.adminUser}" ${process.env.ADMIN_PASSWORD ? '(fjalëkalimi nga server/.env)' : '/ fjalëkalimi "lulea2026" (i paracaktuar)'}`);
});
