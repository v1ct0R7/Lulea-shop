import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import styles from './PageHeader.module.css';
/** Kreu i faqeve të brendshme me breadcrumbs, titull (H1) dhe përshkrim. */
export default function PageHeader({ eyebrow, title, text, crumbs, children }) {
  return (
    <header className={styles.head}>
      <div className="container">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {text && <p className={styles.text}>{text}</p>}
        {children}
      </div>
    </header>
  );
}
