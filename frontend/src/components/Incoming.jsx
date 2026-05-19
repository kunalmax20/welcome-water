import React, { useEffect, useState } from 'react';
import { getProducts, postIncoming } from '../api';
import styles from './StockForm.module.css';

const EMPTY = { productId: '', qty: '', supplier: '', invoice: '', date: new Date().toISOString().split('T')[0] };

export default function Incoming() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { getProducts().then(setProducts); }, []);

  const handleSubmit = async () => {
    if (!form.productId || !form.qty || !form.supplier) {
      setMsg({ type: 'error', text: 'Product, quantity, and supplier are required.' });
      return;
    }
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await postIncoming({
        productId: form.productId,
        qty: parseInt(form.qty),
        supplier: form.supplier,
        invoice: form.invoice,
        date: form.date,
      });
      setMsg({ type: 'success', text: res.message });
      setForm({ ...EMPTY });
      getProducts().then(setProducts);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to process incoming stock.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === form.productId);

  return (
    <div>
      <h1 className={styles.pageTitle}>Stock Ingestion — Incoming</h1>
      <p className={styles.pageSub}>Register new warehouse arrivals and update inventory levels</p>

      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <span className={styles.formHeaderIcon}>📥</span>
          <span>New Incoming Transaction</span>
        </div>

        {msg.text && (
          <div className={`${styles.msgBox} ${msg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
            {msg.type === 'error' ? '⚠ ' : '✅ '}{msg.text}
          </div>
        )}

        <div className={styles.field}>
          <label>Select Product *</label>
          <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}>
            <option value="">— choose a product —</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} · Current stock: {p.stock.toLocaleString()} {p.unit}</option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className={styles.productInfo}>
            <div className={styles.infoRow}>
              <span>Category</span><strong>{selectedProduct.category}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Supplier on record</span><strong>{selectedProduct.supplier}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Current Stock</span>
              <strong className={selectedProduct.stock < selectedProduct.minStock ? styles.danger : styles.ok}>
                {selectedProduct.stock.toLocaleString()} {selectedProduct.unit}
                {selectedProduct.stock < selectedProduct.minStock && ' ⚠ below minimum'}
              </strong>
            </div>
          </div>
        )}

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label>Quantity Received *</label>
            <input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 500" />
          </div>
          <div className={styles.field}>
            <label>Date of Receipt</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>

        <div className={styles.field}>
          <label>Supplier / Vendor *</label>
          <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Vendor or supplier name" />
        </div>

        <div className={styles.field}>
          <label>Invoice / Reference No.</label>
          <input value={form.invoice} onChange={e => setForm({ ...form, invoice: e.target.value })} placeholder="e.g. INV-2025-0088 (optional)" />
        </div>

        <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Processing…' : '📥 Confirm Incoming Stock'}
        </button>
      </div>
    </div>
  );
}
