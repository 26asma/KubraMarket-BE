const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const shopController = require('../controllers/shopController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

// All routes start with /api/admin/users

router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, adminController.getUserById);
router.patch('/users/:id/role', verifyToken, isAdmin, adminController.updateUserRole);
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);


router.get('/merchants', verifyToken, isAdmin, adminController.getAllMerchants);
router.get('/merchants/:id', verifyToken, isAdmin, adminController.getMerchantById);


router.put('/shop/:shopId', verifyToken, isAdmin, shopController.updateShop);
module.exports = router;
