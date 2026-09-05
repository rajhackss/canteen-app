const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint for Render & monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Redirect root to admin panel
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/settings', require('./routes/settings'));

// Serve static assets from admin directory without auto-serving index.html
app.use('/admin', express.static(path.join(__dirname, 'admin'), { index: false }));

// Serve admin panel pages explicitly
app.get(['/admin', '/admin/', '/admin/login'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get(['/admin/index.html', '/admin/dashboard'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});