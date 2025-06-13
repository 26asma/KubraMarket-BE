// controllers/cartController.js
const { Cart, Product } = require('../models');
const messages = require('../constants/messages');

exports.getCart = async (req, res) => {
  try {
    const items = await Cart.findAll({
      where: { user_id: req.user.id },
      include: { model: Product, as: 'product' },
    });
    res.status(200).json({ data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const existing = await Cart.findOne({
      where: { user_id: req.user.id, product_id }
    });

    if (existing) {
      existing.quantity += quantity || 1;
      await existing.save();
      return res.status(200).json({ message: 'Quantity updated', data: existing });
    }

    const item = await Cart.create({
      user_id: req.user.id,
      product_id,
      quantity: quantity || 1
    });
    res.status(201).json({ message: 'Added to cart', data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Cart.findOne({
      where: { user_id: req.user.id, product_id: req.params.productId }
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.quantity = quantity;
    await item.save();
    res.status(200).json({ message: 'Quantity updated', data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    await Cart.destroy({
      where: { user_id: req.user.id, product_id: req.params.productId }
    });
    res.status(200).json({ message: 'Removed from cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};
