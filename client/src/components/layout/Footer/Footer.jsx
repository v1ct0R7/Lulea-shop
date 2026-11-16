import { Link } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import Icon from '../../ui/Icon/Icon';
import styles from './Footer.module.css';

export default function Footer() {
  const { settings, categories } = useShop();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="Lulea logo" width="96" height="96" loading="lazy" />
          <p>{settings?.tagline || 'The Best-Looking Flowers in Town'}</p>
          <div className={styles.social}>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer"><Icon name="instagram" /></a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer"><Icon name="facebook" /></a>
          </div>
        </div>

        <div>
          <h4>Kategoritë</h4>
          <ul>
            {categories.map((c) => (
              <li key={c.id}><Link to={`/kategori/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Lulea</h4>
          <ul>
            <li><Link to="/dyqani">Të gjitha lulet</Link></li>
            <li><Link to="/porosi-e-personalizuar">Krijo buqetën tënde</Link></li>
            <li><Link to="/rreth-nesh">Rreth nesh</Link></li>
            <li><Link to="/kontakt">Kontakt</Link></li>
          </ul>
        </div>

        <div>
          <h4>Na kontaktoni</h4>
          <ul className={styles.contact}>
            <li><Icon name="pin" size={18} /> {settings?.address}</li>
            <li><Icon name="phone" size={18} /> <a href={`tel:${settings?.phone?.replace(/\s/g, '')}`}>{settings?.phone}</a></li>
            <li><Icon name="mail" size={18} /> <a href={`mailto:${settings?.email}`}>{settings?.email}</a></li>
            <li><Icon name="clock" size={18} /> {settings?.hours}</li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">© {new Date().getFullYear()} Lulea. Të gjitha të drejtat e rezervuara.</div>
      </div>
    </footer>
  );
}
