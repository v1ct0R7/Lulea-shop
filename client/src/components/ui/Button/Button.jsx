import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/** Buton i përbashkët: variant = primary | outline | ghost | light | danger, size = sm | md | lg */
export default function Button({ to, href, variant = 'primary', size = 'md', block, className = '', loading, children, ...rest }) {
  const cls = [styles.btn, styles[variant], styles[size], block && styles.block, className].filter(Boolean).join(' ');
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className={styles.dot} aria-hidden /> : null}
      {children}
    </button>
  );
}
