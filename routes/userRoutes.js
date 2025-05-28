const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');

router.use(verifyToken);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.delete('/profile', userController.deleteAccount);

module.exports = router;
