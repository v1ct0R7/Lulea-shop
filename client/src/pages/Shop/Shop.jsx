import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useShop } from '../../context/ShopContext';
import { breadcrumbSchema } from '../../utils/seo';
import Seo from '../../components/ui/Seo/Seo';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Spinner from '../../components/ui/Spinner/Spinner';
import EmptyState from '../../components/ui/EmptyState/EmptyState';
import Button from '../../components/ui/Button/Button';
import Icon from '../../components/ui/Icon/Icon';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import styles from './Shop.module.css';

/** Faqja e dyqanit: /dyqani (të gjitha) dhe /kategori/:slug (një kategori me filtrat e llojeve) */
export default function Shop() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { categories } = useShop();
  const type = params.get('lloji') || '';
  const sort = params.get('rendit') || 'newest';
  const q = params.get('q') || '';
  const [search, setSearch] = useState(q);

  const category = categories.find((c) => c.slug === slug);
  const products = useFetch(() => api.getProducts({ category: slug, type, sort, q }), [slug, type, sort, q]);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  const update = (key, val) => {
    const next = new URLSearchParams(params);
    val ? next.set(key, val) : next.delete(key);
    setParams(next, { replace: true });
  };

  const crumbs = [
    { name: 'Ballina', path: '/' },
    { name: 'Dyqani', path: '/dyqani' },
    ...(category ? [{ name: category.name, path: `/kategori/${category.slug}` }] : []),
  ];
  const activeType = category?.types.find((t) => t.id === type);
  const title = category ? (activeType ? `${category.name} – ${activeType.name}` : category.name) : 'Të gjitha lulet';

  if (slug && categories.length && !category) {
    return (
      <div className="container section">
        <Seo title="Kategoria nuk u gjet" noindex />
        <EmptyState title="Kategoria nuk u gjet" text="Kjo kategori nuk ekziston ose është hequr.">
          <Button to="/dyqani">Shko te dyqani</Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={category ? `${title} – Porosit Online` : 'Dyqani – Të gjitha lulet'}
        description={
          category?.description ||
          'Shfletoni të gjitha buqetat, trëndafilat, kutitë me lule dhe bimët e Lulea. Dërgesë në shtëpi dhe pagesë cash.'
        }
        schema={breadcrumbSchema(crumbs)}
      />
      <PageHeader
        crumbs={crumbs}
        eyebrow={category ? 'Kategoria' : 'Dyqani'}
        title={title}
        text={category?.description || 'Lule të freskëta, të punuara me dorë, për çdo moment të jetës.'}
      />

      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebar}>
          <form
            className={styles.search}
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update('q', search.trim());
            }}
          >
            <Icon name="search" size={18} />
            <input type="search" placeholder="Kërko lule…" aria-label="Kërko lule" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>

          <h2 className={styles.sideTitle}>Kategoritë</h2>
          <ul className={styles.catList}>
            <li><Link to="/dyqani" className={!slug ? styles.on : ''}>Të gjitha</Link></li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/kategori/${c.slug}`} className={slug === c.slug ? styles.on : ''}>
                  {c.name} <span>{c.productCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.content} aria-label="Produktet">
          <div className={styles.toolbar}>
            {category && category.types.length > 0 ? (
              <div className={styles.chips} role="tablist" aria-label="Llojet">
                <button className={!type ? styles.chipOn : ''} onClick={() => update('lloji', '')}>Të gjitha</button>
                {category.types.map((t) => (
                  <button key={t.id} className={type === t.id ? styles.chipOn : ''} onClick={() => update('lloji', t.id)}>
                    {t.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.count}>{products.data ? `${products.data.length} produkte` : ''}</p>
            )}
            <label className={styles.sort}>
              <span>Rendit:</span>
              <select value={sort} onChange={(e) => update('rendit', e.target.value)}>
                <option value="newest">Më të rejat</option>
                <option value="price-asc">Çmimi: ulët → lartë</option>
                <option value="price-desc">Çmimi: lartë → ulët</option>
                <option value="name">Emri A–Z</option>
              </select>
            </label>
          </div>

          {q && (
            <p className={styles.searchInfo}>
              Rezultatet për “{q}” <button onClick={() => update('q', '')}>Pastro</button>
            </p>
          )}

          {products.loading ? (
            <Spinner />
          ) : products.error ? (
            <EmptyState title="Diçka shkoi keq" text={products.error.message}><Button onClick={products.reload}>Provo përsëri</Button></EmptyState>
          ) : products.data.length === 0 ? (
            <EmptyState title="Asnjë produkt" text="Nuk gjetëm lule me këto filtra. Provoni një kategori tjetër ose krijoni buqetën tuaj.">
              <Button to="/porosi-e-personalizuar" variant="outline">Krijo buqetën tënde</Button>
            </EmptyState>
          ) : (
            <ProductGrid products={products.data} />
          )}
        </section>
      </div>
    </>
  );
}
