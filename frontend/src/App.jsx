import React, { useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import Ledger from './components/Ledger.jsx';
import Incoming from './components/Incoming.jsx';
import Outgoing from './components/Outgoing.jsx';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', section: 'modules' },
  { id: 'ledger',    label: 'Inventory Ledger', icon: '☰', section: 'modules' },
  { id: 'incoming',  label: 'Incoming Stock', icon: '↓', section: 'modules' },
  { id: 'outgoing',  label: 'Dispatch Stock', icon: '↑', section: 'modules' },
];

const styles = {
  app: { display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" },
  sidebar: {
    width: 220,
    minWidth: 220,
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  brand: {
    padding: '20px 18px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  brandName: { color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
  brandSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 },
  sectionLabel: {
    padding: '16px 18px 6px',
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 18px',
    cursor: 'pointer',
    fontSize: 13,
    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    borderLeft: `2px solid ${active ? '#3b82f6' : 'transparent'}`,
    transition: 'all 0.12s',
    fontWeight: active ? 500 : 400,
  }),
  navIcon: (active) => ({
    fontSize: 16,
    color: active ? '#3b82f6' : 'rgba(255,255,255,0.3)',
    width: 20,
    textAlign: 'center',
  }),
  sidebarFooter: {
    marginTop: 'auto',
    padding: '16px 18px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 1.6,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '28px 32px',
    background: '#f8fafc',
  },
};

export default function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    if (page === 'dashboard') return <Dashboard onNavigate={setPage} />;
    if (page === 'ledger')    return <Ledger />;
    if (page === 'incoming')  return <Incoming />;
    if (page === 'outgoing')  return <Outgoing />;
    return null;
  };

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandName}>
            <span style={styles.dot} />
            Welcome Water
          </div>
          <div style={styles.brandSub}>Jodhpur Plant · Inventory v1.0</div>
        </div>

        <div style={styles.sectionLabel}>Modules</div>
        {NAV.map(item => (
          <div
            key={item.id}
            style={styles.navItem(page === item.id)}
            onClick={() => setPage(item.id)}
            onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
            onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent'; } }}
          >
            <span style={styles.navIcon(page === item.id)}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={styles.sidebarFooter}>
          Welcome Water Pvt Ltd<br />
          Jodhpur, Rajasthan<br />
          &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        {renderPage()}
      </div>
    </div>
  );
}
