import { useRef, useState } from 'react';
import { api } from '../../../api';
import Icon from '../../ui/Icon/Icon';
import ProductImage from '../../ui/ProductImage/ProductImage';
import styles from './ImageUpload.module.css';

/** Ngarkon një foto në server dhe kthen URL-në përmes onChange. */
export default function ImageUpload({ value, onChange, accent }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await api.uploadImage(file);
      onChange(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.preview}><ProductImage src={value} alt="" accent={accent} /></div>
      <div className={styles.side}>
        <button type="button" className={styles.drop} onClick={() => ref.current.click()} disabled={busy}
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
          <Icon name="upload" />
          <span>{busy ? 'Duke ngarkuar…' : 'Kliko ose tërhiq foton këtu'}</span>
          <small>JPG, PNG, WEBP · deri 5MB</small>
        </button>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
        {value && <button type="button" className={styles.remove} onClick={() => onChange('')}>Hiq foton</button>}
        {error && <span className={styles.err}>{error}</span>}
      </div>
    </div>
  );
}
