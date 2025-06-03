const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const isMerchant = require('../middlewares/isMerchant');

// Merchant Routes
router.post('/raise', verifyToken, isMerchant, maintenanceController.createIssue);
router.get('/my', verifyToken, isMerchant, maintenanceController.getMerchantIssues);

// Admin Routes
router.get('/admin/all', verifyToken, isAdmin, maintenanceController.getAllIssues);
router.patch('/admin/resolve/:id', verifyToken, isAdmin, maintenanceController.resolveIssue);

module.exports = router;
