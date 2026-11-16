import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ngarko .env nëse ekziston (Node 20.12+)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath);
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'lulea2026',
  tokenSecret: process.env.TOKEN_SECRET || 'lulea-dev-secret-ndryshoje',
  tokenTtlHours: 12,
  siteUrl: process.env.SITE_URL || 'http://localhost:5173',
  paths: {
    root: __dirname,
    db: path.join(__dirname, 'data', 'db.json'),
    seed: path.join(__dirname, 'data', 'seed.json'),
    uploads: path.join(__dirname, 'uploads'),
    clientDist: path.join(__dirname, '..', 'client', 'dist'),
  },
};

// Siguria: në prodhim serveri NUK niset me fjalëkalimin ose sekretin e paracaktuar.
if (process.env.NODE_ENV === 'production') {
  const weak = [];
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 10) weak.push('ADMIN_PASSWORD (min. 10 karaktere)');
  if (!process.env.TOKEN_SECRET || process.env.TOKEN_SECRET.length < 32) weak.push('TOKEN_SECRET (min. 32 karaktere)');
  if (weak.length) {
    console.error(`\n❌ Vendosni në server/.env: ${weak.join(', ')}\n`);
    process.exit(1);
  }
}
