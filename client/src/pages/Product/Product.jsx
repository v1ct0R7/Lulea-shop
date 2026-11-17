import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useCart } from '../../context/CartContext';
import { useShop } from '../../context/ShopContext';
import { formatPrice } from '../../utils/format';
import { breadcrumbSchema, productSchema } from '../../utils/seo';
import Seo from '../../components/ui/Seo/Seo';
import Breadcrumbs from '../../components/ui/Breadcrumbs/Breadcrumbs';
import ProductImage from '../../components/ui/ProductImage/ProductImage';
import QuantityInput from '../../components/ui/QuantityInput/QuantityInput';
import Button from '../../components/ui/Button/Button';
import Icon from '../../components/ui/Icon/Icon';
import Spinner from '../../components/ui/Spinner/Spinner';
import EmptyState from '../../components/ui/EmptyState/EmptyState';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import styles from './Product.module.css';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { categories } = useShop();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { data: p, loading, error } = useFetch(() => api.getProduct(slug), [slug]);
  const related = useFetch(
    () => (p ? api.getProducts({ category: p.categoryId, exclude: p.id, limit: 4 }) : Promise.resolve([])),
    [p?.id]
  );

  if (loading) return <Spinner />;
  if (error || !p) {
    return (
      <div className="container section">
        <Seo title="Produkti nuk u gjet" noindex />
        <EmptyState title="Produkti nuk u gjet" text="Ky produkt mund të jetë hequr nga koleksioni.">
          <Button to="/dyqani">Kthehu te dyqani</Button>
        </EmptyState>
      </div>
    );
  }

  const accent = categories.find((c) => c.id === p.categoryId)?.accent;
  const crumbs = [
    { name: 'Kryefaqja', path: '/' },
    ...(p.category ? [{ name: p.category.name, path: `/kategori/${p.category.slug}` }] : []),
    { name: p.name, path: `/produkt/${p.slug}` },
  ];

  const handleAdd = (goToCart) => {
    add({ ...p, accent }, qty);
    if (goToCart) return navigate('/shporta');
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <>
      <Seo
        title={`${p.name} – ${formatPrice(p.price)}`}
        description={`${p.description} Porosit online te Lulea me dërgesë në shtëpi dhe pagesë cash.`.slice(0, 160)}
        image={p.image || '/logo.png'}
        type="product"
        schema={[productSchema(p), breadcrumbSchema(crumbs)]}
      />
      <div className={`container ${styles.wrap}`}>
        <Breadcrumbs items={crumbs} />
        <div className={styles.grid}>
          <div className={styles.media}>
            <ProductImage src={p.image} alt={p.name} accent={accent} eager />
          </div>

          <div className={styles.info}>
            {p.type && <span className="eyebrow">{p.category?.name} · {p.type.name}</span>}
            <h1>{p.name}</h1>
            <div className={styles.price}>
              {formatPrice(p.price)}
              {p.oldPrice > p.price && <s>{formatPrice(p.oldPrice)}</s>}
            </div>
            <p className={styles.desc}>{p.description}</p>

            {p.inStock ? (
              <>
                <div className={styles.buy}>
                  <QuantityInput value={qty} onChange={setQty} />
                  <Button size="lg" onClick={() => handleAdd(false)} className={styles.addBtn}>
                    <Icon name={added ? 'check' : 'bag'} size={18} /> {added ? 'U shtua!' : 'Shto në shportë'}
                  </Button>
                </div>
                <Button variant="outline" size="lg" block onClick={() => handleAdd(true)}>Porosit tani</Button>
              </>
            ) : (
              <div className="alert alert-error">Ky produkt për momentin nuk është në stok.</div>
            )}

            <ul className={styles.perks}>
              <li><Icon name="truck" /> <div><strong>Dërgesë në të njëjtën ditë</strong><span>Për porositë para orës 15:00</span></div></li>
              <li><Icon name="cash" /> <div><strong>Pagesë cash në dorëzim</strong><span>Pa pagesë paraprake, pa karta</span></div></li>
              <li><Icon name="gift" /> <div><strong>Kartolinë falas</strong><span>Me mesazhin tuaj, shkruar me dorë</span></div></li>
            </ul>

            <details className={styles.care}>
              <summary>Si të kujdeseni për lulet</summary>
              <p>Prisni kërcejtë diagonalisht 2 cm, vendosini në ujë të freskët dhe ndërroni ujin çdo dy ditë. Mbajini larg diellit direkt dhe frutave.</p>
            </details>
          </div>
        </div>

        {related.data?.length > 0 && (
          <section className={styles.related}>
            <h2>Mund t’ju pëlqejnë edhe</h2>
            <ProductGrid products={related.data} />
          </section>
        )}
      </div>
    </>
  );
}
