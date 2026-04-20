require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Database ─────────────────────────────────────────────────────
connectDB();

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/packages', require('./routes/packages'));
app.use('/api/inquiries', require('./routes/inquiries'));

// Destinations shortcut
app.get('/api/destinations', (req, res) => {
  const { destinations } = require('./data/mockData');
  res.json({ success: true, data: destinations });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Server is running 🚀', timestamp: new Date().toISOString() });
});

// ─── Frontend Routing (SPA fallback) ─────────────────────────────
app.get('/packages', (req, res) => res.sendFile(path.join(__dirname, '../frontend/packages.html')));
app.get('/packages/:id', (req, res) => res.sendFile(path.join(__dirname, '../frontend/package-detail.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../frontend/contact.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

// ─── Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌍 Travel & Tours Server is running!`);
  console.log(`🚀 Backend API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend:    http://localhost:${PORT}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET  /api/packages          - All packages`);
  console.log(`  GET  /api/packages/featured - Featured packages`);
  console.log(`  GET  /api/packages/:id      - Single package`);
  console.log(`  GET  /api/destinations      - Destinations list`);
  console.log(`  POST /api/inquiries         - Submit inquiry`);
  console.log(`  POST /api/inquiries/whatsapp- Get WhatsApp URL\n`);
});
