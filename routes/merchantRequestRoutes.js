const express = require('express');
const router = express.Router();
const merchantRequestController = require('../controllers/merchantRequestController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

router.post('/', verifyToken, merchantRequestController.createRequest);
router.get('/', verifyToken, isAdmin, merchantRequestController.getAllRequests);
router.patch('/:id/status', verifyToken, isAdmin, merchantRequestController.updateStatus);
router.get('/status/:status', verifyToken, isAdmin, merchantRequestController.getRequestsByStatus);

module.exports = router;
