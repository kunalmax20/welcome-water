import React, { useEffect, useState } from 'react';
import { getProducts, postOutgoing } from '../api';
import styles from './StockForm.module.css';

const EMPTY = { productId: '', qty: '', destination: '', invoice: '', date: new Date().toISOString().split('T')[0] };

export default function Outgoing() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [dispatchError, setDispatchError] = useState('');

  useEffect(() => { getProducts().then(setProducts); }, []);

  const selectedProduct = products.find(p => p.id === form.productId);

  const handleQtyChange = (val) => {
    setForm({ ...form, qty: val });
    if (selectedProduct && parseInt(val) > selectedProduct.stock) {
      setDispatchError(`Cannot dispatch! Only ${selectedProduct.stock.toLocaleString()} ${selectedProduct.unit} available.`);
    } else {
      setDispatchError('');
    }
  };

  const handleProductChange = (id) => {
    setForm({ ...form, productId: id, qty: '' });
    setDispatchError('');
  };

  const gaugePct = selectedProduct
    ? Math.min(100, Math.round((selectedProduct.stock / (selectedProduct.minStock * 2)) * 100))
    : 0;

  const handleSubmit = async () => {
    if (!form.productId || !form.qty || !form.destination) {
      setMsg({ type: 'error', text: 'Product, quantity, and destination are required.' });
      return;
    }
    if (dispatchError) return;
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await postOutgoing({
        productId: form.productId,
        qty: parseInt(form.qty),
        destination: form.destination,
        invoice: form.invoice,
        date: form.date,
      });
      setMsg({ type: 'success', text: res.message });
      setForm({ ...EMPTY });
      setDispatchError('');
      getProducts().then(setProducts);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to process dispatch.';
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Asset Dispatch — Outgoing</h1>
      <p className={styles.pageSub}>Log warehouse dispatches with built-in stock safeguards</p>

      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <span className={styles.formHeaderIcon}>📤</span>
          <span>New Dispatch Transaction</span>
        </div>

        {msg.text && (
          <div className={`${styles.msgBox} ${msg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
            {msg.type === 'error' ? '⚠ ' : '✅ '}{msg.text}
          </div>
        )}

        <div className={styles.field}>
          <label>Select Product *</label>
          <select value={form.productId} onChange={e => handleProductChange(e.target.value)}>
            <option value="">— choose a product —</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} · {p.stock.toLocaleString()} {p.unit} available</option>
            ))}
          </select>
        </div>

        {/* Live Stock Gauge */}
        {selectedProduct && (
          <div className={styles.gaugeWrap}>
            <div className={styles.gaugeLabel}>
              <span>Available Stock Gauge</span>
              <strong className={selectedProduct.stock < selectedProduct.minStock ? styles.danger : styles.ok}>
                {selectedProduct.stock.toLocaleString()} {selectedProduct.unit}
              </strong>
            </div>
            <div className={styles.gaugeBar}>
              <div
                className={styles.gaugeFill}
                style={{
                  width: `${gaugePct}%`,
                  background: selectedProduct.stock < selectedProduct.minStock ? 'var(--red)' : '#22c55e',
                }}
              />
            </div>
            <div className={styles.gaugeSub}>
              {selectedProduct.stock < selectedProduct.minStock
                ? `⚠ Below safety threshold (min: ${selectedProduct.minStock.toLocaleString()})`
                : `Above safety threshold (min: ${selectedProduct.minStock.toLocaleString()} ${selectedProduct.unit})`}
            </div>
          </div>
        )}

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label>Quantity to Dispatch *</label>
            <input
              type="number"
              min="1"
              value={form.qty}
              onChange={e => handleQtyChange(e.target.value)}
              placeholder="e.g. 100"
              className={dispatchError ? styles.inputError : ''}
            />
          </div>
          <div className={styles.field}>
            <label>Date of Dispatch</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>

        {/* Hard Block Error */}
        {dispatchError && (
          <div className={styles.hardError}>
            <span className={styles.hardErrorIcon}>🚫</span>
            <span>{dispatchError}</span>
          </div>
        )}

        <div className={styles.field}>
          <label>Destination / Recipient *</label>
          <input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Delhi Distributor" />
        </div>

        <div className={styles.field}>
          <label>Dispatch Reference / Invoice</label>
          <input value={form.invoice} onChange={e => setForm({ ...form, invoice: e.target.value })} placeholder="e.g. DSP-2025-0045 (optional)" />
        </div>

        <button
          className={`${styles.btnSubmit} ${styles.btnDanger}`}
          onClick={handleSubmit}
          disabled={submitting || !!dispatchError}
        >
          {submitting ? 'Processing…' : '📤 Confirm Dispatch'}
        </button>
      </div>
    </div>
  );
}
