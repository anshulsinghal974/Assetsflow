require('dotenv').config();

// Optional DNS override — only needed on networks that block MongoDB SRV lookups.
// Set USE_GOOGLE_DNS=true in .env to enable. Safe to leave disabled on most PCs.
if (process.env.USE_GOOGLE_DNS === 'true') {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// ---------------------------------------------------------------------------
// Route imports
// ---------------------------------------------------------------------------
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const deptRoutes = require('./routes/deptRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const assetRoutes = require('./routes/assetRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const transferRoutes = require('./routes/transferRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');

// ---------------------------------------------------------------------------
// App initialization
// ---------------------------------------------------------------------------
const app = express();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Health-check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'AssetFlow API is running.' });
});

// ---------------------------------------------------------------------------
// Mount routers under /api
// ---------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audits', auditRoutes);

// ---------------------------------------------------------------------------
// 404 handler — unknown routes
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ---------------------------------------------------------------------------
// Centralized error handler
// Catches all errors thrown/forwarded from controllers via asyncHandler.
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('🔥 Unhandled error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ success: false, message: 'Invalid ID format.' });
  }

  // Default 500
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// ---------------------------------------------------------------------------
// Database connection & server start
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assetflow';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 AssetFlow server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Promise Rejection:', err);
  // In production you might want to gracefully shut down
});

module.exports = app; // export for testing
