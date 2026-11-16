import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE } from '../../../utils/seo';

/**
 * Menaxhon meta-tag-et për çdo faqe: title, description, canonical, Open Graph, Twitter dhe JSON-LD.
 */
export default function Seo({ title, description = SITE.defaultDescription, image = '/logo.png', type = 'website', noindex, schema }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | Lulea` : 'Lulea – Dyqan Lulesh Online | Buqeta & Dërgesë në Shtëpi';
  const url = `${SITE.url}${pathname}`;
  const img = image.startsWith('http') ? image : `${SITE.url}${image}`;
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <html lang="sq" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="sq_AL" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
}
