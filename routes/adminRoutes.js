const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const shopController = require('../controllers/shopController');
const rentController = require('../controllers/rentController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const shopUpload = require('../middlewares/uploadMiddleware/shopUpload');


router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);
router.get('/shops', verifyToken, isAdmin, shopController.getAllShops);
router.get('/users/:id', verifyToken, isAdmin, adminController.getUserById);
router.patch('/users/:id/role', verifyToken, isAdmin, adminController.updateUserRole);
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);


router.get('/merchants', verifyToken, isAdmin, adminController.getAllMerchants);
router.get('/merchants/:id', verifyToken, isAdmin, adminController.getMerchantById);
router.get('/rent/history',verifyToken, isAdmin,rentController.getAllRentPayments);      
router.get('/rent/due',verifyToken, isAdmin,rentController.getAllDuePayments);
router.get('/rent/shop/:shopId', verifyToken, isAdmin, rentController.getRentPaymentsByShop); 
router.get('/rent/summary', verifyToken, isAdmin, rentController.getRentSummary);
router.get('/rent/summary/shop', verifyToken, isAdmin, rentController.getShopDueSummary);
// router.put('/shop/:shopId', verifyToken, isAdmin, shopController.updateShopByAdmin);
router.get('/shop/:shopId', verifyToken, isAdmin, shopController.getShopById);
router.put(
  '/shop/:shopId',
  shopUpload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  verifyToken,
  isAdmin,
  shopController.updateShopByAdmin
);
router.delete('/shop/:shopId', verifyToken, isAdmin, shopController.deleteShop);

module.exports = router;
