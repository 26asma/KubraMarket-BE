const { Shop, Merchant } = require('../models');
const messages = require('../constants/messages');

module.exports = async function isMerchant(req, res, next) {
  try {
    const userId = req.user.id;
    const shopId = req.params.shopId;


    // Find the merchant for the logged-in user
    const merchant = await Merchant.findOne({ where: { user_id: userId } });

    if (!merchant) {
      return res.status(403).json({ message: messages.auth.NOT_MERCHANT });
    }

    // Validate that this merchant is linked to the requested shop
    const shop = await Shop.findOne({ where: { id: shopId, merchant_id: merchant.id } });

    if (!shop) {
      return res.status(403).json({ message: messages.auth.NOT_AUTHORIZED_MERCHANT });
    }

    // Attach merchant and shop to request for controller use
    req.merchant = merchant;
    req.shop = shop;
    next();

  } catch (error) {
    console.error('❌ Merchant validation failed:', error);
    res.status(500).json({ message: messages.general.SERVER_ERROR, error: error.message });
  }
};
