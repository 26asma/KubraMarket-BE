const express = require('express');
const router = express.Router();
const rentController = require('../controllers/rentController');
const verifyToken = require('../middlewares/verifyToken');
const isMerchant = require('../middlewares/isMerchant');



router.patch('/:id/pay',verifyToken,isMerchant, rentController.payRent);
router.get('/history',verifyToken,isMerchant, rentController.getRentHistory);
router.get('/due',verifyToken,isMerchant, rentController.getDuePayments);


module.exports = router;
