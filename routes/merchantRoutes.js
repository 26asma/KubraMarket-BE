const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const verifyToken = require('../middlewares/verifyToken');
const isMerchant = require('../middlewares/isMerchant');


router.put('/shop/:shopId', verifyToken, isMerchant, shopController.updateShopByMerchant);

module.exports = router;
