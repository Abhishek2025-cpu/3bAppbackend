// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

router.post('/place-order', orderController.placeOrder);
router.get('/get-orders', orderController.getOrders);
router.get('/get-orders/:userId', orderController.getOrdersByUserId);
router.put('/update-status', orderController.updateProductOrderStatus);

module.exports = router;
