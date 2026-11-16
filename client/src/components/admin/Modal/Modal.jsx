import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../ui/Icon/Icon';
import styles from './Modal.module.css';

export default function Modal({ open, title, onClose, children, wide, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${wide ? styles.wide : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className={styles.head}>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Mbyll"><Icon name="close" /></button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.foot}>{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
