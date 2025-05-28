// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

router.post('/place-order', orderController.placeOrder);
router.get('/get-orders', orderController.getOrders);
router.get('/get-orders/:userId', orderController.getOrdersByUserId);
router.patch('/orders/update-status/:orderId', orderController.updateProductOrderStatusByProductOrderId);

module.exports = router;
