const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const orderRoutes = require('./routes/orderRoutes');
const path = require('path');
const fs = require('fs');

const cors = require('cors');
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();




// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Default route
app.get('/', (req, res) => res.send('API is running...'));

// Start server
const PORT = process.env.PORT || 2025;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
