const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
// router.post('/', verifyToken,isAdmin,categoryController.createCategory);

const upload = require('../middlewares/multerUpload'); // Adjust path as needed


router.post(
  '/',
  verifyToken,isAdmin,
  upload.single('image'), 
 categoryController.createCategory
);

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById );
// router.put('/:id', verifyToken,isAdmin,categoryController.updateCategory);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), categoryController.updateCategory);

router.delete('/:id', verifyToken,isAdmin,categoryController.deleteCategory);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/shop/:shopId', categoryController.getCategoriesForShop);
router.get('/shops/:slug', categoryController.getShopsByCategory);
module.exports = router;
