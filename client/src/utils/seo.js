export const SITE = {
  name: 'Lulea',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  defaultDescription:
    'Lulea – lulet më të bukura në qytet. Buqeta të punuara me dorë, trëndafila, kuti me lule dhe porosi të personalizuara me dërgesë në shtëpi.',
};

/** JSON-LD për biznesin (Florist) – ndihmon Google të shfaqë informacionin e dyqanit. */
export const floristSchema = (settings) => ({
  '@context': 'https://schema.org',
  '@type': 'Florist',
  name: 'Lulea',
  slogan: settings?.tagline,
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  image: `${SITE.url}/logo.png`,
  telephone: settings?.phone,
  email: settings?.email,
  address: { '@type': 'PostalAddress', streetAddress: settings?.address, addressCountry: 'XK' },
  openingHours: 'Mo-Sa 08:00-21:00',
  paymentAccepted: 'Cash',
  priceRange: '€€',
});

export const productSchema = (p) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.name,
  description: p.description,
  image: p.image ? `${SITE.url}${p.image}` : `${SITE.url}/logo.png`,
  sku: p.id,
  brand: { '@type': 'Brand', name: 'Lulea' },
  category: p.category?.name,
  offers: {
    '@type': 'Offer',
    priceCurrency: 'EUR',
    price: p.price,
    availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: `${SITE.url}/produkt/${p.slug}`,
  },
});

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${SITE.url}${it.path}`,
  })),
});
