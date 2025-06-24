const { ProductVariant } = require('../models');

// Create one or many variants
exports.createVariants = async (req, res) => {
  const { productId } = req.params;
  const variants = req.body; // expect array

  try {
    const created = await ProductVariant.bulkCreate(
      variants.map(v => ({ ...v, product_id: productId }))
    );
    res.status(201).json({ message: 'Variants created', data: created });
  } catch (error) {
    res.status(500).json({ message: 'Error creating variants', error });
  }
};

// Get all variants of a product
exports.getVariantsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const variants = await ProductVariant.findAll({ where: { product_id: productId } });
    res.status(200).json({ data: variants });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching variants', error });
  }
};

// Update a single variant
exports.updateVariant = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await ProductVariant.update(req.body, { where: { id } });
    res.status(200).json({ message: 'Variant updated', result: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating variant', error });
  }
};

// Delete a variant
exports.deleteVariant = async (req, res) => {
  const { id } = req.params;

  try {
    await ProductVariant.destroy({ where: { id } });
    res.status(200).json({ message: 'Variant deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting variant', error });
  }
};
