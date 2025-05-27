const express = require('express');
const router = express.Router();
const controller = require('../Controllers/cartFavoriteController');

router.post('/cart/add', controller.addToCart);
router.post('/cart/remove', controller.removeFromCart);
router.get('/cart/:userId', controller.getCart);

router.post('/favorite/add', controller.addToFavorite);
router.post('/favorite/remove', controller.removeFromFavorite);
router.get('/favorite/:userId', controller.getFavorites);

module.exports = router;
