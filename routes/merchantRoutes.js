const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const shopController = require('../controllers/shopController');
const verifyToken = require('../middlewares/verifyToken');
const isMerchant = require('../middlewares/isMerchant');


// router.put('/shop/:shopId', verifyToken, isMerchant, shopController.updateShopByMerchant);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
router.get('/myshop', verifyToken, merchantController.getMyShop);
router.put(
  '/shop/:shopId',
  verifyToken,
  isMerchant,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  shopController.updateShopByMerchant
);

module.exports = router;
