const express = require("express");
const cors = require("cors"); // <-- 1. Make sure this line is here
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000; // Accept dynamic port from Render
const DB_PATH = path.join(__dirname, "db.json");

// ── Middleware ──────────────────────────────────────────────────────────────
// CRITICAL: app.use(cors()) MUST come BEFORE any route definitions like app.get()
app.use(
  cors({
    origin: "https://welcome-water-inventory.onrender.com", // Explicitly allow your frontend
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());

// ── DB Helpers ──────────────────────────────────────────────────────────────
// ... (Your functions readDB, writeDB, generateId continue below exactly the same)

// ── DB Helpers ──────────────────────────────────────────────────────────────
function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function generateId(prefix, list) {
  const nums = list
    .map((item) => parseInt(item.id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

// ── GET /api/products ───────────────────────────────────────────────────────
// Returns the full database layout for the dashboard interface
app.get("/api/products", (req, res) => {
  try {
    const db = readDB();

    // Return BOTH arrays inside the object so your dashboard can map them safely!
    res.json({
      success: true,
      products: db.products,
      activityLogs: db.activityLogs,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to read database." });
  }
});

// ── POST /api/products ──────────────────────────────────────────────────────
// Register a new product
app.post("/api/products", (req, res) => {
  try {
    const { name, category, stock, unit, supplier, minStock } = req.body;
    if (!name || !category || !unit || !supplier) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, category, unit, supplier.",
      });
    }
    const db = readDB();
    const newProduct = {
      id: generateId("P", db.products),
      name: name.trim(),
      category,
      stock: parseInt(stock) || 0,
      unit: unit.trim(),
      supplier: supplier.trim(),
      minStock: parseInt(minStock) || 100,
    };
    db.products.push(newProduct);

    // Log the opening stock if > 0
    if (newProduct.stock > 0) {
      db.activityLogs.unshift({
        id: generateId("L", db.activityLogs),
        product: newProduct.name,
        productId: newProduct.id,
        supplier: newProduct.supplier,
        qty: newProduct.stock,
        type: "INCOMING",
        invoice: "OPENING-STOCK",
        date: new Date().toISOString().split("T")[0],
        timestamp: new Date().toISOString(),
      });
    }
    writeDB(db);
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed to create product." });
  }
});

// ── POST /api/products/incoming ─────────────────────────────────────────────
// Add incoming stock for an existing product
app.post("/api/products/incoming", (req, res) => {
  try {
    const { productId, qty, supplier, invoice, date } = req.body;
    if (!productId || !qty || !supplier) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: productId, qty, supplier.",
      });
    }
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be a positive integer.",
      });
    }
    const db = readDB();
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${productId} not found.`,
      });
    }
    product.stock += quantity;
    const logEntry = {
      id: generateId("L", db.activityLogs),
      product: product.name,
      productId: product.id,
      supplier: supplier.trim(),
      qty: quantity,
      type: "INCOMING",
      invoice: invoice ? invoice.trim() : "",
      date: date || new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
    };
    db.activityLogs.unshift(logEntry);
    writeDB(db);
    res.json({
      success: true,
      message: `Stock updated. New balance: ${product.stock} ${product.unit}.`,
      data: { product, log: logEntry },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed to process incoming stock." });
  }
});

// ── POST /api/products/outgoing ─────────────────────────────────────────────
// Dispatch (subtract) stock for an existing product
app.post("/api/products/outgoing", (req, res) => {
  try {
    const { productId, qty, destination, invoice, date } = req.body;
    if (!productId || !qty || !destination) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: productId, qty, destination.",
      });
    }
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be a positive integer.",
      });
    }
    const db = readDB();
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${productId} not found.`,
      });
    }
    if (quantity > product.stock) {
      return res.status(409).json({
        success: false,
        error: `Cannot dispatch! Only ${product.stock} ${product.unit} available for ${product.name}.`,
      });
    }
    product.stock -= quantity;
    const logEntry = {
      id: generateId("L", db.activityLogs),
      product: product.name,
      productId: product.id,
      supplier: destination.trim(),
      qty: -quantity,
      type: "OUTGOING",
      invoice: invoice ? invoice.trim() : "",
      date: date || new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
    };
    db.activityLogs.unshift(logEntry);
    writeDB(db);
    res.json({
      success: true,
      message: `Dispatched ${quantity} ${product.unit}. Remaining: ${product.stock}.`,
      data: { product, log: logEntry },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed to process outgoing dispatch." });
  }
});

// ── GET /api/logs ───────────────────────────────────────────────────────────
// Returns paginated activity logs
app.get("/api/logs", (req, res) => {
  try {
    const db = readDB();
    const limit = parseInt(req.query.limit) || 50;
    res.json({ success: true, data: db.activityLogs.slice(0, limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to read logs." });
  }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Welcome Water backend is running.",
    timestamp: new Date().toISOString(),
  });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Welcome Water backend running at http://localhost:${PORT}`);
});
