const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const cartFavoriteRoutes = require('./routes/cartFavoriteRoutes');
const shippingAddressRoutes = require('./routes/shippingAddressRoutes');

const orderRoutes = require('./routes/orderRoutes');
const path = require('path');
const fs = require('fs');

const cors = require('cors');
dotenv.config();
const app = express();



// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));


// Connect to MongoDB
connectDB();




// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use('/api', shippingAddressRoutes);

app.use('/api', cartFavoriteRoutes);
app.post('/remove-from-cart', async (req, res) => {
  try {
    const { userId, productIds } = req.body;
    console.log({ userId, productIds }); // should log your data
    if (!userId || !productIds) {
      return res.status(400).json({ success: false, message: 'UserId and productIds required' });
    }
    res.json({ success: true, message: 'Test passed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});



// Default route
app.get('/', (req, res) => res.send('API is running...'));

// Start server
const PORT = process.env.PORT || 2025;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
