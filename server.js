const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const path = require('path');
const fs = require('fs');

const cors = require('cors');
dotenv.config();
const app = express();
const multer = require('multer');
// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();


['uploads/catImgs', 'uploads/productImgs'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Default route
app.get('/', (req, res) => res.send('API is running...'));

// Start server
const PORT = process.env.PORT || 2025;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
