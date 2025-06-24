const express = require('express');
const router = express.Router();
const variantController = require('../controllers/productVariantController');

// POST - Create one/many variants
router.post('/:productId/variants', variantController.createVariants);

// GET - All variants for a product
router.get('/:productId/variants', variantController.getVariantsByProduct);

// PATCH - Update a specific variant
router.patch('/variant/:id', variantController.updateVariant);

// DELETE - Delete a specific variant
router.delete('/variant/:id', variantController.deleteVariant);

module.exports = router;
