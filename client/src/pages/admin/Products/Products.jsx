import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import { useFetch } from '../../../hooks/useFetch';
import { useShop } from '../../../context/ShopContext';
import { formatPrice } from '../../../utils/format';
import Button from '../../../components/ui/Button/Button';
import Icon from '../../../components/ui/Icon/Icon';
import Spinner from '../../../components/ui/Spinner/Spinner';
import ProductImage from '../../../components/ui/ProductImage/ProductImage';
import Modal from '../../../components/admin/Modal/Modal';
import ImageUpload from '../../../components/admin/ImageUpload/ImageUpload';
import StatusBadge from '../../../components/admin/StatusBadge/StatusBadge';

const empty = { name: '', categoryId: '', typeId: '', price: '', oldPrice: '', description: '', image: '', featured: false, inStock: true };

export default function Products() {
  const { categories, refreshCategories } = useShop();
  const [params, setParams] = useSearchParams();
  const { data: products, loading, reload } = useFetch(() => api.getProducts({ sort: 'newest' }), []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm({ ...empty, categoryId: categories[0]?.id || '' });
    setError('');
    setEditing('new');
  };
  const openEdit = (p) => {
    setForm({ ...empty, ...p, typeId: p.typeId || '', oldPrice: p.oldPrice || '' });
    setError('');
    setEditing(p);
  };
  const close = () => setEditing(null);

  useEffect(() => {
    if (params.get('shto') && categories.length) {
      openNew();
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, categories.length]);

  const list = useMemo(() => {
    let l = products || [];
    if (cat) l = l.filter((p) => p.categoryId === cat);
    if (q) l = l.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    return l;
  }, [products, q, cat]);

  const selectedCat = categories.find((c) => c.id === form.categoryId);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, price: Number(form.price), oldPrice: form.oldPrice ? Number(form.oldPrice) : 0 };
    try {
      if (editing === 'new') await api.createProduct(payload);
      else await api.updateProduct(editing.id, payload);
      close();
      reload();
      refreshCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Të fshihet “${p.name}”? Ky veprim s’kthehet mbrapsht.`)) return;
    await api.deleteProduct(p.id);
    reload();
    refreshCategories();
  };

  const toggle = async (p, field) => {
    await api.updateProduct(p.id, { [field]: !p[field] });
    reload();
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Produktet</h1>
          <p>{products?.length ?? 0} produkte në dyqan</p>
        </div>
        <Button onClick={openNew} disabled={!categories.length}><Icon name="plus" size={18} /> Shto produkt</Button>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="input" placeholder="Kërko produkt…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Të gjitha kategoritë</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {loading ? <Spinner /> : list.length === 0 ? (
          <p className="adm-empty">Asnjë produkt nuk u gjet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Produkti</th><th>Kategoria / Lloji</th><th>Çmimi</th><th>E veçuar</th><th>Në stok</th><th /></tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="adm-prod">
                        <div className="adm-thumb"><ProductImage src={p.image} alt="" accent={categories.find((c) => c.id === p.categoryId)?.accent} /></div>
                        <div><strong>{p.name}</strong><small>/{p.slug}</small></div>
                      </div>
                    </td>
                    <td>{p.category?.name}<br /><small className="adm-muted">{p.type?.name || '—'}</small></td>
                    <td>{formatPrice(p.price)}{p.oldPrice ? <><br /><s className="adm-muted">{formatPrice(p.oldPrice)}</s></> : null}</td>
                    <td><label className="adm-switch"><input type="checkbox" checked={p.featured} onChange={() => toggle(p, 'featured')} aria-label="E veçuar" /></label></td>
                    <td>
                      <button className="adm-icon-btn" style={{ width: 'auto' }} onClick={() => toggle(p, 'inStock')} title="Ndrysho stokun">
                        <StatusBadge label={p.inStock ? 'Po' : 'Jo'} tone={p.inStock ? 'success' : 'danger'} />
                      </button>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <a className="adm-icon-btn" href={`/produkt/${p.slug}`} target="_blank" rel="noreferrer" title="Shiko"><Icon name="eye" size={18} /></a>
                        <button className="adm-icon-btn" onClick={() => openEdit(p)} title="Ndrysho"><Icon name="edit" size={18} /></button>
                        <button className="adm-icon-btn danger" onClick={() => remove(p)} title="Fshi"><Icon name="trash" size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={close} wide title={editing === 'new' ? 'Produkt i ri' : 'Ndrysho produktin'}
        footer={<><Button variant="ghost" onClick={close}>Anulo</Button><Button type="submit" form="product-form" loading={saving}>Ruaj</Button></>}>
        <form id="product-form" onSubmit={save} className="form-grid two">
          {error && <div className="alert alert-error span-2">{error}</div>}
          <div className="field span-2">
            <label htmlFor="pn">Emri i produktit *</label>
            <input id="pn" className="input" required value={form.name} onChange={set('name')} placeholder="P.sh. Buqeta “Mëngjes Pranvere”" />
          </div>
          <div className="field">
            <label htmlFor="pc">Kategoria *</label>
            <select id="pc" className="select" required value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value, typeId: '' }))}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pt">Lloji</label>
            <select id="pt" className="select" value={form.typeId} onChange={set('typeId')}>
              <option value="">— Pa lloj —</option>
              {selectedCat?.types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pp">Çmimi (€) *</label>
            <input id="pp" className="input" type="number" step="0.01" min="0.01" required value={form.price} onChange={set('price')} />
          </div>
          <div className="field">
            <label htmlFor="po">Çmimi i vjetër (€)</label>
            <input id="po" className="input" type="number" step="0.01" min="0" value={form.oldPrice} onChange={set('oldPrice')} />
            <span className="hint">Plotësojeni për ta shfaqur si ofertë.</span>
          </div>
          <div className="field span-2">
            <label htmlFor="pd">Përshkrimi</label>
            <textarea id="pd" className="textarea" rows={4} value={form.description} onChange={set('description')} />
          </div>
          <div className="field span-2">
            <label>Foto</label>
            <ImageUpload value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} accent={selectedCat?.accent} />
          </div>
          <label className="adm-switch"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Shfaq në ballinë (e veçuar)</label>
          <label className="adm-switch"><input type="checkbox" checked={form.inStock} onChange={set('inStock')} /> Në stok</label>
        </form>
      </Modal>
    </>
  );
}
