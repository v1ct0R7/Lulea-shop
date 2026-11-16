import Icon from '../Icon/Icon';
import styles from './QuantityInput.module.css';
export default function QuantityInput({ value, onChange, min = 1, max = 50, small }) {
  return (
    <div className={`${styles.qty} ${small ? styles.small : ''}`}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Zvogëlo sasinë" disabled={value <= min}>
        <Icon name="minus" size={14} />
      </button>
      <input type="number" value={value} min={min} max={max} aria-label="Sasia"
        onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value, 10) || min)))} />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Rrit sasinë" disabled={value >= max}>
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
