// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

router.post('/place-order', orderController.placeOrder);

module.exports = router;
