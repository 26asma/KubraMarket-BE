const { Shop,Merchant,Category,ShopSpecification } = require('../models');
const messages = require('../constants/messages');


 exports.getMyShop = async (req, res) => {
  try {
    const userId = req.user.id;

    const merchant = await Merchant.findOne({ where: { user_id: userId } });
    if (!merchant) {
      return res.status(403).json({ success: false, message: messages.auth.UNAUTHORIZED });
    }

    const shop = await Shop.findOne({
      where: { merchant_id: merchant.id },
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'name']
        },
        {
          model: ShopSpecification,
          as: 'specification',
          attributes: ['delivery_type', 'is_exchangeable']
        }
      ]
    });

    if (!shop) {
      return res.status(404).json({ success: false, message: messages.shop.NOT_FOUND });
    }

    return res.status(200).json({
      success: true,
      shop
    });
  } catch (error) {
    console.error('[GET_MY_SHOP_ERROR]', error);
    return res.status(500).json({ success: false, message: messages.general.SERVER_ERROR });
  }
};
