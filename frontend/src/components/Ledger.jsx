import React, { useEffect, useState } from 'react';
import { getProducts, createProduct } from '../api';
import styles from './Ledger.module.css';

const EMPTY_FORM = { name: '', category: 'Raw Material', stock: '', unit: '', supplier: '', minStock: '' };

export default function Ledger() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');

  const load = () => getProducts().then(setProducts).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.name || !form.unit || !form.supplier) {
      setMsg({ type: 'error', text: 'Name, unit, and supplier are required.' });
      return;
    }
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      await createProduct({
        name: form.name,
        category: form.category,
        stock: parseInt(form.stock) || 0,
        unit: form.unit,
        supplier: form.supplier,
        minStock: parseInt(form.minStock) || 100,
      });
      setMsg({ type: 'success', text: `"${form.name}" registered successfully.` });
      setForm(EMPTY_FORM);
      load();
      setTimeout(() => setShowModal(false), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create product.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}><div className={styles.spinner} />Loading ledger…</div>;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Complete Inventory Ledger</h1>
          <p className={styles.pageSub}>{products.length} products registered · Jodhpur Plant Catalog</p>
        </div>
        <button className={styles.btnAdd} onClick={() => { setShowModal(true); setMsg({ type: '', text: '' }); }}>
          + Add Product
        </button>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍  Search by name, category, or supplier…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Supplier</th>
                <th>Min. Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className={styles.noResults}>No products match your search.</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className={p.stock < p.minStock ? styles.rowAlert : ''}>
                  <td className={styles.idCell}>{p.id}</td>
                  <td className={styles.nameCell}>{p.name}</td>
                  <td>
                    <span className={`${styles.catBadge} ${p.category === 'Raw Material' ? styles.raw : styles.fg}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className={p.stock < p.minStock ? styles.stockLow : styles.stockOk}>
                    {p.stock.toLocaleString()}
                  </td>
                  <td className={styles.muted}>{p.unit}</td>
                  <td className={styles.muted}>{p.supplier}</td>
                  <td className={styles.muted}>{p.minStock.toLocaleString()}</td>
                  <td>
                    {p.stock < p.minStock
                      ? <span className={styles.statusLow}>⚠ LOW</span>
                      : <span className={styles.statusOk}>✓ OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Register New Product</span>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            {msg.text && (
              <div className={`${styles.msgBox} ${msg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
                {msg.text}
              </div>
            )}
            <div className={styles.field}>
              <label>Product Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 500ml Preforms" />
            </div>
            <div className={styles.field}>
              <label>Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option>Raw Material</option>
                <option>Finished Goods</option>
              </select>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Opening Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" min="0" />
              </div>
              <div className={styles.field}>
                <label>Unit *</label>
                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Boxes / Bags / Rolls" />
              </div>
            </div>
            <div className={styles.field}>
              <label>Supplier *</label>
              <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
            </div>
            <div className={styles.field}>
              <label>Minimum Stock Threshold</label>
              <input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} placeholder="100" min="0" />
            </div>
            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Registering…' : 'Register Product'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
