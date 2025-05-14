// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

router.post('/place-order', orderController.placeOrder);
router.get('/get-orders', orderController.getOrders);

module.exports = router;
