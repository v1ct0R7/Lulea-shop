import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useShop } from '../../../context/ShopContext';
import Icon from '../../ui/Icon/Icon';
import styles from './Header.module.css';

const links = [
  { to: '/', label: 'Ballina', end: true },
  { to: '/dyqani', label: 'Dyqani', mega: true },
  { to: '/porosi-e-personalizuar', label: 'Krijo Buqetën' },
  { to: '/rreth-nesh', label: 'Rreth Nesh' },
  { to: '/kontakt', label: 'Kontakt' },
];

export default function Header() {
  const { count } = useCart();
  const { categories } = useShop();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <button className={styles.burger} onClick={() => setOpen(true)} aria-label="Hap menunë" aria-expanded={open}>
          <Icon name="menu" />
        </button>

        <Link to="/" className={styles.brand} aria-label="Lulea – Ballina">
          <img src="/logo.png" alt="" width="52" height="52" />
          <span>Lulea</span>
        </Link>

        <nav className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Navigimi kryesor">
          <div className={styles.navHead}>
            <span className={styles.navTitle}>Lulea</span>
            <button onClick={() => setOpen(false)} aria-label="Mbyll menunë"><Icon name="close" /></button>
          </div>
          <ul>
            {links.map((l) => (
              <li key={l.to} className={l.mega ? styles.hasMega : ''}>
                <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? styles.active : '')}>
                  {l.label}
                </NavLink>
                {l.mega && categories.length > 0 && (
                  <div className={styles.mega}>
                    {categories.map((c) => (
                      <div key={c.id} className={styles.megaCol}>
                        <Link to={`/kategori/${c.slug}`} className={styles.megaTitle}>{c.name}</Link>
                        {c.types.map((t) => (
                          <Link key={t.id} to={`/kategori/${c.slug}?lloji=${t.id}`}>{t.name}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

        <div className={styles.actions}>
          <Link to="/dyqani" className={styles.iconBtn} aria-label="Kërko lule"><Icon name="search" /></Link>
          <Link to="/shporta" className={styles.iconBtn} aria-label={`Shporta, ${count} artikuj`}>
            <Icon name="bag" />
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
