// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const verifyToken = require('../middlewares/verifyToken');

router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.patch('/:productId', cartController.updateCartItem);
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;