import { api } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useShop } from '../../context/ShopContext';
import { floristSchema } from '../../utils/seo';
import Seo from '../../components/ui/Seo/Seo';
import Button from '../../components/ui/Button/Button';
import Icon from '../../components/ui/Icon/Icon';
import FloralArt from '../../components/ui/FloralArt/FloralArt';
import Spinner from '../../components/ui/Spinner/Spinner';
import CategoryCard from '../../components/category/CategoryCard/CategoryCard';
import ProductGrid from '../../components/product/ProductGrid/ProductGrid';
import styles from './Home.module.css';

const perks = [
  { icon: 'leaf', title: 'Gjithmonë të freskëta', text: 'Lule të zgjedhura çdo mëngjes' },
  { icon: 'truck', title: 'Dërgesë e shpejtë', text: 'Në të njëjtën ditë në qytet' },
  { icon: 'cash', title: 'Pagesë cash', text: 'Paguani vetëm kur i merrni' },
  { icon: 'heart', title: 'Punuar me dorë', text: 'Çdo buqetë është unike' },
];

const steps = [
  { n: '01', title: 'Zgjidhni ose krijoni', text: 'Shfletoni koleksionin ose ndërtoni buqetën tuaj lule për lule.' },
  { n: '02', title: 'Shkruani adresën', text: 'Na tregoni ku dhe kur t’i dërgojmë, plus një mesazh për kartolinën.' },
  { n: '03', title: 'Paguani në dorëzim', text: 'Korrieri ua sjell lulet të freskëta – ju paguani cash në derë.' },
];

const reviews = [
  { name: 'Arta K.', text: 'Buqeta ishte edhe më e bukur se në foto. Dërgesa erdhi në kohë, ekipi shumë i sjellshëm!' },
  { name: 'Driton M.', text: 'E krijova vetë buqetën për përvjetorin – gruaja ime mbeti pa fjalë. Faleminderit Lulea!' },
  { name: 'Elira B.', text: 'Lulet më të freskëta në qytet. Orkideja ime po lulëzon ende pas dy muajsh.' },
];

export default function Home() {
  const { categories, settings } = useShop();
  const featured = useFetch(() => api.getProducts({ featured: true, limit: 8 }), []);

  return (
    <>
      <Seo
        description="Lulea – lulet më të bukura në qytet. Buqeta me dorë, trëndafila, kuti me lule, bimë dhe porosi të personalizuara. Dërgesë në shtëpi, pagesë cash."
        schema={floristSchema(settings)}
      />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className="eyebrow">Atelier lulesh · Që nga 2026</span>
            <h1>Lule që flasin <em>në vend tuaj</em></h1>
            <p>
              Buqeta të punuara me dashuri, të freskëta çdo ditë dhe të dërguara te dera juaj.
              Zgjidhni nga koleksioni ynë ose krijoni buqetën tuaj të përsosur.
            </p>
            <div className={styles.heroCtas}>
              <Button to="/dyqani" size="lg">Shiko koleksionin</Button>
              <Button to="/porosi-e-personalizuar" variant="outline" size="lg">Krijo buqetën tënde</Button>
            </div>
            <ul className={styles.heroMeta}>
              <li><strong>2.000+</strong> klientë të lumtur</li>
              <li><strong>4.9★</strong> vlerësim mesatar</li>
            </ul>
          </div>
          <div className={styles.heroArt} aria-hidden>
            <div className={styles.blob} />
            <img src="/logo.png" alt="" className={styles.heroLogo} width="500" height="500" fetchpriority="high" />
            <FloralArt className={styles.floatA} color="#b89b72" variant={1} />
            <FloralArt className={styles.floatB} color="#c98b8b" variant={2} />
          </div>
        </div>
      </section>

      {/* PERKS */}
      <section className={styles.perks} aria-label="Pse Lulea">
        <div className={`container ${styles.perksGrid}`}>
          {perks.map((p) => (
            <div key={p.title} className={styles.perk}>
              <Icon name={p.icon} size={28} stroke={1.3} />
              <div><strong>{p.title}</strong><span>{p.text}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* KATEGORITË */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Kategoritë</span>
            <h2>Gjeni lulet për çdo rast</h2>
            <p>Nga një buqetë e thjeshtë falënderimi deri te dekori i plotë i dasmës – çdo kategori ka llojet e saj.</p>
          </div>
          <div className={styles.cats}>
            {categories.map((c, i) => <CategoryCard key={c.id} category={c} index={i} />)}
          </div>
        </div>
      </section>

      {/* TË ZGJEDHURAT */}
      <section className={`section ${styles.featured}`}>
        <div className="container">
          <div className={styles.rowHead}>
            <div>
              <span className="eyebrow">Të preferuarat</span>
              <h2>Më të dashurat e javës</h2>
            </div>
            <Button to="/dyqani" variant="ghost">Shiko të gjitha <Icon name="arrow" size={16} /></Button>
          </div>
          {featured.loading ? <Spinner /> : <ProductGrid products={featured.data || []} />}
        </div>
      </section>

      {/* CTA – PERSONALIZIMI */}
      <section className="section">
        <div className="container">
          <div className={styles.custom}>
            <div className={styles.customText}>
              <span className="eyebrow">Porosi e personalizuar</span>
              <h2>Ju zgjidhni lulet. Ne i bëjmë art.</h2>
              <p>
                Zgjidhni llojin e luleve, ngjyrat, sasinë, stilin dhe mbështjellësin. Shikoni çmimin në kohë reale
                dhe floristët tanë e krijojnë buqetën ekzaktësisht si e keni imagjinuar.
              </p>
              <Button to="/porosi-e-personalizuar" variant="light" size="lg"><Icon name="sparkle" size={18} /> Fillo krijimin</Button>
            </div>
            <FloralArt className={styles.customArt} color="#f5ece1" />
          </div>
        </div>
      </section>

      {/* SI FUNKSIONON */}
      <section className={`section ${styles.steps}`}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Shumë e thjeshtë</span>
            <h2>Si funksionon</h2>
          </div>
          <ol className={styles.stepsGrid}>
            {steps.map((s) => (
              <li key={s.n}>
                <span className={styles.stepN}>{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* VLERËSIMET */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Fjalët e klientëve</span>
            <h2>Çfarë thonë për ne</h2>
          </div>
          <div className={styles.reviews}>
            {reviews.map((r) => (
              <figure key={r.name} className={styles.review}>
                <div className={styles.stars} aria-label="5 nga 5 yje">★★★★★</div>
                <blockquote>“{r.text}”</blockquote>
                <figcaption>— {r.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
