import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import { useShop } from '../../../context/ShopContext';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/ui/Icon/Icon';
import ProductImage from '../../../components/ui/ProductImage/ProductImage';
import Modal from '../../../components/admin/Modal/Modal';
import ImageUpload from '../../../components/admin/ImageUpload/ImageUpload';
import styles from './Categories.module.css';

const empty = { name: '', description: '', accent: '#c98b8b', image: '', types: [] };

export default function Categories() {
  const { categories, refreshCategories } = useShop();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [newType, setNewType] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(empty); setError(''); setEditing('new'); };
  const openEdit = (c) => { setForm({ ...empty, ...c, types: c.types.map((t) => ({ ...t })) }); setError(''); setEditing(c); };

  useEffect(() => {
    if (params.get('shto')) { openNew(); setParams({}, { replace: true }); }
  }, [params, setParams]);

  const addType = () => {
    const name = newType.trim();
    if (!name || form.types.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;
    setForm((f) => ({ ...f, types: [...f.types, { name }] }));
    setNewType('');
  };
  const renameType = (i, name) => setForm((f) => ({ ...f, types: f.types.map((t, j) => (j === i ? { ...t, name } : t)) }));
  const removeType = (i) => setForm((f) => ({ ...f, types: f.types.filter((_, j) => j !== i) }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, types: form.types.filter((t) => t.name.trim()) };
      if (editing === 'new') await api.createCategory(payload);
      else await api.updateCategory(editing.id, payload);
      await refreshCategories();
      setEditing(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Të fshihet kategoria “${c.name}”?`)) return;
    try {
      await api.deleteCategory(c.id);
      refreshCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Kategoritë</h1>
          <p>Çdo kategori ka llojet e veta (p.sh. Trëndafila → Të kuq, Të bardhë…)</p>
        </div>
        <Button onClick={openNew}><Icon name="plus" size={18} /> Shto kategori</Button>
      </div>

      <div className={styles.grid}>
        {categories.map((c, i) => (
          <article key={c.id} className={`adm-card ${styles.card}`}>
            <div className={styles.img}><ProductImage src={c.image} alt="" accent={c.accent} seed={i} /></div>
            <div className={styles.body}>
              <div className={styles.top}>
                <h2>{c.name}</h2>
                <span className={styles.count}>{c.productCount} produkte</span>
              </div>
              <p>{c.description}</p>
              <div className={styles.types}>
                {c.types.length ? c.types.map((t) => <span key={t.id}>{t.name}</span>) : <em className="adm-muted">Pa lloje</em>}
              </div>
              <div className={styles.actions}>
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Icon name="edit" size={15} /> Ndrysho</Button>
                <button className="adm-icon-btn danger" onClick={() => remove(c)} title="Fshi"><Icon name="trash" size={18} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Kategori e re' : 'Ndrysho kategorinë'}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Anulo</Button><Button type="submit" form="cat-form" loading={saving}>Ruaj</Button></>}>
        <form id="cat-form" onSubmit={save} className="form-grid">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label htmlFor="cn">Emri *</label>
            <input id="cn" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="cd">Përshkrimi (shfaqet edhe në Google)</label>
            <textarea id="cd" className="textarea" rows={3} maxLength={400} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label>Llojet e kësaj kategorie</label>
            <div className={styles.typeEditor}>
              {form.types.map((t, i) => (
                <div key={t.id || i} className={styles.typeRow}>
                  <input className="input" value={t.name} onChange={(e) => renameType(i, e.target.value)} aria-label="Emri i llojit" />
                  <button type="button" className="adm-icon-btn danger" onClick={() => removeType(i)} aria-label="Hiq llojin"><Icon name="close" size={16} /></button>
                </div>
              ))}
              <div className={styles.typeRow}>
                <input className="input" placeholder="Lloj i ri, p.sh. Pastel" value={newType} onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addType(); } }} />
                <Button type="button" size="sm" variant="outline" onClick={addType}><Icon name="plus" size={15} /> Shto</Button>
              </div>
            </div>
          </div>
          <div className="field">
            <label htmlFor="ca">Ngjyra e theksit</label>
            <input id="ca" type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className={styles.color} />
          </div>
          <div className="field">
            <label>Foto e kategorisë</label>
            <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} accent={form.accent} />
          </div>
        </form>
      </Modal>
    </>
  );
}
