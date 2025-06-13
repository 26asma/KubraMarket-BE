const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const upload = require('../middlewares/multerUpload'); // multer config
const verifyToken = require('../middlewares/verifyToken');
const isMerchant = require('../middlewares/isMerchant');
const { createProductSchema } = require('../validators/productValidator');
const validate = require('../middlewares/validate');
router.post(
  '/',
  verifyToken,
  isMerchant,
  validate(createProductSchema),
  upload.array('images', 5), // <-- move this to end of middlewares
  productController.createProduct
);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id',  verifyToken,isMerchant,validate(createProductSchema), upload.array('images', 5), productController.updateProduct);
router.get('/shop/:shopId/products', productController.getProductsByShop);
router.delete('/:id', verifyToken, isMerchant, productController.deleteProduct);

module.exports = router;