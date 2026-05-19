# Welcome Water — Inventory Manager
### Jodhpur Bottled Water Plant · Full-Stack Web Application

---

## Project Structure

```
welcome-water/
├── backend/
│   ├── server.js       ← Express API server (Port 5000)
│   ├── db.json         ← Flat-file JSON database
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx              ← Root app with sidebar routing
    │   ├── api.js               ← Axios API service layer
    │   ├── index.css            ← Global styles
    │   ├── main.jsx             ← React entry point
    │   └── components/
    │       ├── Dashboard.jsx    ← Live analytics dashboard
    │       ├── Ledger.jsx       ← Full inventory table + add product
    │       ├── Incoming.jsx     ← Incoming stock form
    │       └── Outgoing.jsx     ← Dispatch form with safeguards
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9 or higher (comes with Node)

---

## Quick Start (Local Development)

### Step 1 — Install backend dependencies

```bash
cd welcome-water/backend
npm install
```

### Step 2 — Start the backend server

```bash
npm start
# OR for auto-reload during development:
npm run dev
```

Backend will run at **http://localhost:5000**

### Step 3 — Install frontend dependencies (new terminal)

```bash
cd welcome-water/frontend
npm install
```

### Step 4 — Start the frontend dev server

```bash
npm run dev
```

Frontend will run at **http://localhost:5173**

Open **http://localhost:5173** in your browser. Both servers must be running simultaneously.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Register a new product |
| POST | `/api/products/incoming` | Add incoming stock |
| POST | `/api/products/outgoing` | Dispatch stock (with validation) |
| GET | `/api/logs?limit=50` | Get activity logs |

### POST /api/products/incoming — payload
```json
{
  "productId": "P001",
  "qty": 500,
  "supplier": "Ravi Polymers",
  "invoice": "INV-2025-0088",
  "date": "2025-05-20"
}
```

### POST /api/products/outgoing — payload
```json
{
  "productId": "P001",
  "qty": 100,
  "destination": "Delhi Distributor",
  "invoice": "DSP-2025-0045",
  "date": "2025-05-20"
}
```

---

## Production Build

### Build the frontend

```bash
cd frontend
npm run build
```

This generates a `dist/` folder. You can then serve it statically.

### Serve frontend from the Express backend (optional)

Add these lines to `backend/server.js` after the API routes:

```javascript
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

Then run only the backend — it will serve the full app at **http://localhost:5000**

---

## Database

All data lives in `backend/db.json`. Three collections:
- **products** — the product catalog with stock levels
- **activityLogs** — every transaction, prepended (newest first)
- **admins** — admin credentials (default: `admin` / `welcome@2025`)

Back up `db.json` regularly — it is your entire database.

---

## Default Products (Seeded)

| ID | Name | Category | Opening Stock | Min Threshold |
|----|------|----------|---------------|---------------|
| P001 | Blue Bottle Caps | Raw Material | 265 bags | 500 |
| P002 | Preforms (28mm) | Raw Material | 1,840 boxes | 1,000 |
| P003 | Preforms (38mm) | Raw Material | 320 boxes | 800 |
| P004 | White Bottle Caps | Raw Material | 750 bags | 500 |
| P005 | 1L Water Bottles | Finished Goods | 4,200 boxes | 2,000 |
| P006 | Shrink Labels | Raw Material | 900 rolls | 400 |

---

## Deploying on a Local Network (Factory LAN)

1. Find your machine's local IP: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
2. Start both servers as above
3. On other factory floor devices, open: `http://<YOUR-IP>:5173`

For production on a server, use a process manager like **PM2**:

```bash
npm install -g pm2
cd backend && pm2 start server.js --name "welcome-water-api"
```

---

*Welcome Water Pvt Ltd · Jodhpur, Rajasthan*
