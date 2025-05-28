const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const isAdmin = require('../middlewares/isAdmin');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, isAdmin, shopController.createShop);
router.get('/:shopId', shopController.getShopById);
router.get('/',shopController.getAllShops);
router.delete('/:shopId', verifyToken, isAdmin, shopController.deleteShop);

module.exports = router;
