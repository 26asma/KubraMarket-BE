
// controllers/wishlistController.js
const { Wishlist, Product } = require('../models');
const messages = require('../constants/messages');

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: { model: Product, as: 'product' },
    });
    res.status(200).json({ data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;

    const exists = await Wishlist.findOne({
      where: { user_id: req.user.id, product_id }
    });

    if (exists) {
      return res.status(400).json({ message: 'Already in wishlist' });
    }

    const item = await Wishlist.create({
      user_id: req.user.id,
      product_id
    });
    res.status(201).json({ message: 'Added to wishlist', data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.destroy({
      where: { user_id: req.user.id, product_id: req.params.productId }
    });
    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};