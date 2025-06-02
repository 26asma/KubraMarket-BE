const { User, Merchant, Shop,sequelize} = require('../models');
const { v4: uuidv4 } = require('uuid');
const messages = require('../constants/messages').general;
const shopmessages = require('../constants/messages').shop;
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

exports.updateShop = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { shopId } = req.params;
    const {
      shop_name,
      description,
      categories,
      has_physical_shop,
      location,
      logo_url,
      banner_url,
      annual_income,
      delivery_type,
      is_exchangeable,
      monthly_rent
    } = req.body;

    // 1. Validate shop exists
    const shop = await Shop.findByPk(shopId, { transaction });
    if (!shop) {
      await transaction.rollback();
      return res.status(404).json({ message: messages.NOT_FOUND });
    }

if (shop_name) {
  shop.shop_name = shop_name;

  // Also update shop_name in the Merchant table
  const merchant = await Merchant.findOne({ where: { id: shop.merchant_id }, transaction });
  if (merchant) {
    merchant.shop_name = shop_name;
    await merchant.save({ transaction });
  }
}

if (description !== undefined) shop.description = description;
if (has_physical_shop !== undefined) shop.has_physical_shop = has_physical_shop;
if (location !== undefined) shop.location = location;
if (logo_url !== undefined) shop.logo_url = logo_url;
if (banner_url !== undefined) shop.banner_url = banner_url;
if (annual_income !== undefined) shop.annual_income = annual_income;
if (monthly_rent !== undefined) shop.monthly_rent = monthly_rent;

    await shop.save({ transaction });

    // ✅ 3. Update shop_name in Merchant table (sync)
    if (shop_name) {
      await Merchant.update(
        { shop_name },
        { where: { id: shop.merchant_id }, transaction }
      );
    }

    // 4. Update shop specification
    if (delivery_type || is_exchangeable !== undefined) {
      const [spec, created] = await ShopSpecification.findOrCreate({
        where: { shop_id: shop.id },
        defaults: { delivery_type, is_exchangeable },
        transaction
      });

      if (!created) {
        spec.delivery_type = delivery_type ?? spec.delivery_type;
        spec.is_exchangeable = is_exchangeable ?? spec.is_exchangeable;
        await spec.save({ transaction });
      }
    }

    // 5. Handle many-to-many shop ↔ categories
    if (Array.isArray(categories)) {
      await ShopCategory.destroy({ where: { shop_id: shop.id }, transaction });

      for (const catName of categories) {
        const [category] = await Category.findOrCreate({
          where: { name: catName },
          defaults: {
            slug: catName.toLowerCase().replace(/\s+/g, '-'),
            is_active: true
          },
          transaction
        });

        await ShopCategory.create({
          shop_id: shop.id,
          category_id: category.id
        }, { transaction });
      }
    }

    await transaction.commit();
    return res.status(200).json({ message: shopmessages.SHOP_UPDATED });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ message: messages.SERVER_ERROR,error: error.message });
  }
};
