import { Router } from 'express';
import { db } from '../utils/db.js';
import { config } from '../config.js';

const router = Router();

/** sitemap.xml dinamik – përfshin çdo kategori dhe produkt */
router.get('/sitemap.xml', (_req, res) => {
  const base = config.siteUrl.replace(/\/$/, '');
  const { categories, products } = db.data;
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/dyqani', priority: '0.9', changefreq: 'daily' },
    { loc: '/porosi-e-personalizuar', priority: '0.9', changefreq: 'monthly' },
    { loc: '/rreth-nesh', priority: '0.5', changefreq: 'yearly' },
    { loc: '/kontakt', priority: '0.5', changefreq: 'yearly' },
    ...categories.map((c) => ({ loc: `/kategori/${c.slug}`, priority: '0.8', changefreq: 'weekly' })),
    ...products.map((p) => ({
      loc: `/produkt/${p.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: (p.updatedAt || p.createdAt).slice(0, 10),
    })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${base}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

router.get('/robots.txt', (_req, res) => {
  const base = config.siteUrl.replace(/\/$/, '');
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${base}/sitemap.xml\n`);
});

export default router;
