import { useEffect, useRef, useState } from 'react';
import '../../../styles/admin.css';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import Seo from '../../ui/Seo/Seo';
import Icon from '../../ui/Icon/Icon';
import styles from './AdminLayout.module.css';

const POLL_MS = 15000;

/** Tingull i shkurtër njoftimi (pa skedar audio) */
function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.15 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.15 + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.15);
      o.stop(ctx.currentTime + i * 0.15 + 0.45);
    });
  } catch {
    /* ignore */
  }
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [unseen, setUnseen] = useState(0);
  const [toast, setToast] = useState('');
  const [menu, setMenu] = useState(false);
  const last = useRef(null);

  // Kontrollon periodikisht për porosi të reja
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const s = await api.getOrderStats();
        if (!alive) return;
        if (last.current !== null && s.unseen > last.current) {
          const diff = s.unseen - last.current;
          const msg = diff === 1 ? `Porosi e re: ${s.latest[0]?.number}` : `${diff} porosi të reja`;
          setToast(msg);
          chime();
          if ('Notification' in window && Notification.permission === 'granted') new Notification('Lulea – ' + msg);
          window.dispatchEvent(new Event('lulea:new-order'));
        }
        last.current = s.unseen;
        setUnseen(s.unseen);
      } catch {
        /* ignore */
      }
    };
    check();
    const t = setInterval(check, POLL_MS);
    const onSeen = () => check();
    window.addEventListener('lulea:orders-changed', onSeen);
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener('lulea:orders-changed', onSeen);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  const links = [
    { to: '/admin', label: 'Paneli', icon: 'grid', end: true },
    { to: '/admin/porosite', label: 'Porositë', icon: 'list', badge: unseen },
    { to: '/admin/produktet', label: 'Produktet', icon: 'box' },
    { to: '/admin/kategorite', label: 'Kategoritë', icon: 'flower' },
  ];

  return (
    <div className={styles.shell}>
      <Seo title="Admin" noindex />
      <aside className={`${styles.side} ${menu ? styles.open : ''}`}>
        <Link to="/admin" className={styles.brand}>
          <img src="/logo.png" alt="" width="40" height="40" /> <span>Lulea</span> <small>admin</small>
        </Link>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? styles.active : '')}>
              <Icon name={l.icon} size={19} /> {l.label}
              {l.badge > 0 && <span className={styles.badge}>{l.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className={styles.bottom}>
          <a href="/" target="_blank" rel="noreferrer"><Icon name="eye" size={19} /> Shiko faqen</a>
          <button onClick={logout}><Icon name="logout" size={19} /> Dil ({user?.username})</button>
        </div>
      </aside>
      {menu && <div className={styles.backdrop} onClick={() => setMenu(false)} />}

      <div className={styles.main}>
        <header className={styles.top}>
          <button className={styles.burger} onClick={() => setMenu(true)} aria-label="Menuja"><Icon name="menu" /></button>
          <Link to="/admin/porosite" className={styles.bell} aria-label={`${unseen} porosi të reja`}>
            <Icon name="bell" />
            {unseen > 0 && <span>{unseen}</span>}
          </Link>
        </header>
        <div className={styles.content}><Outlet /></div>
      </div>

      {toast && (
        <Link to="/admin/porosite" className={styles.toast} onClick={() => setToast('')}>
          <Icon name="bell" /> {toast}
        </Link>
      )}
    </div>
  );
}
