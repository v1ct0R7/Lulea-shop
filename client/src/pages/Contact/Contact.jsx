import { useShop } from '../../context/ShopContext';
import Seo from '../../components/ui/Seo/Seo';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Icon from '../../components/ui/Icon/Icon';
import styles from './Contact.module.css';

export default function Contact() {
  const { settings: s } = useShop();
  const items = s
    ? [
        { icon: 'phone', label: 'Telefoni', value: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
        { icon: 'mail', label: 'Email', value: s.email, href: `mailto:${s.email}` },
        { icon: 'pin', label: 'Adresa', value: s.address },
        { icon: 'clock', label: 'Orari', value: s.hours },
      ]
    : [];
  return (
    <>
      <Seo title="Kontakt" description="Kontaktoni Lulea për porosi, dasma dhe evente. Telefon, email, adresa dhe orari i punës." />
      <PageHeader crumbs={[{ name: 'Kryefaqja', path: '/' }, { name: 'Kontakt', path: '/kontakt' }]} eyebrow="Jemi këtu për ju" title="Na kontaktoni" text="Për porosi të mëdha, dasma ose evente, na telefononi ose na shkruani – përgjigjemi shpejt." />
      <section className={`container section ${styles.grid}`}>
        {items.map((it) => (
          <div key={it.label} className={styles.card}>
            <Icon name={it.icon} size={28} stroke={1.3} />
            <span>{it.label}</span>
            {it.href ? <a href={it.href}>{it.value}</a> : <strong>{it.value}</strong>}
          </div>
        ))}
      </section>
    </>
  );
}
