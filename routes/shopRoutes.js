const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const productController = require('../controllers/productController');
const isAdmin = require('../middlewares/isAdmin');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, isAdmin, shopController.createShop);
router.get('/:shopId', shopController.getShopById);
router.get('/',shopController.getShops);
router.delete('/:shopId', verifyToken, isAdmin, shopController.deleteShop);
router.get('/:shopId/products', productController.getProductsByShop);
module.exports = router;
