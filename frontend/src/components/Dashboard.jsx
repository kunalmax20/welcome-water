import React, { useEffect, useState } from 'react';
import { getProducts, getLogs } from '../api';
import styles from './Dashboard.module.css';

export default function Dashboard({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProducts(), getLogs(5)])
      .then(([prods, lgz]) => { setProducts(prods); setLogs(lgz); })
      .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} />Loading dashboard…</div>;
  if (error) return <div className={styles.errorBanner}>{error}</div>;

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowItems = products.filter(p => p.stock < p.minStock);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Live Analytics Dashboard</h1>
        <p className={styles.pageSub}>Real-time overview · Jodhpur Bottled Water Plant</p>
      </div>

      {/* Stat Cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>📦</div>
          <div className={styles.statLabel}>Total Inventory Units</div>
          <div className={styles.statValue}>{totalStock.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>🗂</div>
          <div className={styles.statLabel}>Active Catalog</div>
          <div className={styles.statValue}>{products.length} <span className={styles.statUnit}>products</span></div>
        </div>
        <div className={`${styles.statCard} ${lowItems.length > 0 ? styles.dangerCard : ''}`}>
          <div className={styles.statIcon} style={{ background: lowItems.length > 0 ? '#fee2e2' : '#f0fdf4', color: lowItems.length > 0 ? '#dc2626' : '#16a34a' }}>
            {lowItems.length > 0 ? '⚠️' : '✅'}
          </div>
          <div className={styles.statLabel}>Low Stock Alerts</div>
          <div className={`${styles.statValue} ${lowItems.length > 0 ? styles.dangerValue : styles.okValue}`}>
            {lowItems.length} <span className={styles.statUnit}>items</span>
          </div>
        </div>
      </div>

      <div className={styles.row}>
        {/* Recent Log */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>🕐 Recent Supply Log</div>
          {logs.length === 0 && <p className={styles.empty}>No transactions yet.</p>}
          {logs.map(log => (
            <div key={log.id} className={styles.logItem}>
              <div>
                <div className={styles.logName}>{log.product}</div>
                <div className={styles.logMeta}>{log.supplier} · {log.date}</div>
              </div>
              <span className={`${styles.badge} ${log.type === 'INCOMING' ? styles.badgeIn : styles.badgeOut}`}>
                {log.qty > 0 ? '+' : ''}{log.qty.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Stock Shortage Widget */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>🚨 Stock Shortage Check</div>
          {lowItems.length === 0 ? (
            <div className={styles.allOk}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <div>All items are above their safety threshold.</div>
            </div>
          ) : lowItems.map(p => (
            <div key={p.id} className={styles.alertItem}>
              <div>
                <div className={styles.alertName}>{p.name}</div>
                <div className={styles.alertStock}>
                  ⚠ {p.stock.toLocaleString()} in stock · Min: {p.minStock.toLocaleString()} {p.unit}
                </div>
                <div className={styles.alertBar}>
                  <div className={styles.alertBarFill} style={{ width: `${Math.min(100, Math.round((p.stock / p.minStock) * 100))}%` }} />
                </div>
              </div>
              <button className={styles.btnOrder} onClick={() => onNavigate('incoming')}>ORDER NOW →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
