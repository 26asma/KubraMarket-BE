const { User, Merchant, Shop,sequelize} = require('../models');
const { v4: uuidv4 } = require('uuid');
const messages = require('../constants/messages').general;
const authMessages = require('../constants/messages').auth;
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ success: false, message: messages.USER_NOT_FOUND });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};



exports.updateUserRole = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { role } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: authMessages.USER_NOT_FOUND,
      });
    }

    const previousRole = user.role;

    if (previousRole === role) {
      await transaction.rollback();
      return res.status(200).json({
        success: true,
        message: messages.ACTION_SUCCESS,
        data: user,
      });
    }

    user.role = role;
    await user.save({ transaction });

    // 👉 Demote merchant → customer or admin
    if (previousRole === 'merchant' && role !== 'merchant') {
      const merchant = await Merchant.findOne({
        where: { user_id: user.id },
        transaction,
      });

      if (merchant) {
        await Shop.destroy({
          where: { merchant_id: merchant.id },
          transaction,
        });

        await merchant.destroy({ transaction });
      }
    }

    // 👉 Promote to merchant
    if (role === 'merchant') {
      let merchant = await Merchant.findOne({
        where: { user_id: user.id },
        transaction,
      });

      if (!merchant) {
        const shopId = `SHOP-${uuidv4().slice(0, 4)}`;
        const shopName = `${user.name}'s Shop`;

        merchant = await Merchant.create(
          {
            user_id: user.id,
            shop_id: shopId,
            shop_name: shopName,
           
          },
          { transaction }
        );

        await Shop.create(
          {
            merchant_id: merchant.id,
            shop_id: shopId,
            shop_name: shopName,
            description: 'Welcome to your new shop! Customize it anytime.',
            category: 'general',
            has_physical_shop: false,
            location: '',
            logo_url: '',
            banner_url: '',
            annual_income: 0.0,
            is_active: false,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: messages.ACTION_SUCCESS,
      data: user,
    });

  } catch (err) {
    await transaction.rollback();
    console.error("❌ updateUserRole failed:", err);
    return res.status(500).json({
      success: false,
      message: messages.SERVER_ERROR,
      error: err.message,
    });
  }
};



exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: messages.USER_NOT_FOUND });
    }
    await user.destroy();
    res.status(200).json({ success: true, message: messages.USER_DELETED });
  } catch (err) {
    next(err);
  }
};
exports.getAllMerchants = async (req, res, next) => {
  try {
    const merchants = await Merchant.findAll({ attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, data: merchants });
  } catch (err) {
    next(err);
  }
};

exports.getMerchantById = async (req, res, next) => {
  try {
    const merchant = await Merchant.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!Merchant) {
      return res.status(404).json({ success: false, message: messages.USER_NOT_FOUND });
    }
    res.status(200).json({ success: true, data: merchant });
  } catch (err) {
    next(err);
  }
};