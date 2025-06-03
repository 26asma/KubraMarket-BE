const { Shop, Merchant, User,Category,ShopSpecification,ShopCategory } = require('../models');
const messages = require('../constants/messages');
const { v4: uuidv4 } = require('uuid');

// Create a new shop
exports.createShop = async (req, res, next) => {
  try {
    const {
      shop_name,
      description,
      category,
      has_physical_shop,
      location,
      logo_url,
      banner_url,
      annual_income,
    } = req.body;

    if (!shop_name) {
      return res.status(400).json({ error: messages.general.BAD_REQUEST });
    }

    const shop_id = uuidv4(); 

    const newShop = await Shop.create({
      shop_id,
      shop_name,
      description,
      category,
      has_physical_shop,
      location,
      logo_url,
      banner_url,
      annual_income,
    });

    return res.status(201).json({
      message:messages.shop.SHOP_CREATED,
      data: newShop,
    });
  } catch (error) {
    next(error);
  }
};


exports.updateShopByAdmin = async (req, res) => {
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
      monthly_rent,
      is_active,
      delivery_type,
      is_exchangeable
    } = req.body;

    // 1. Fetch the shop
    const shop = await Shop.findByPk(shopId, { transaction });

    if (!shop) {
      await transaction.rollback();
      return res.status(404).json({ message: messages.general.NOT_FOUND });
    }

    // 2. Update all allowed fields (Admin has full access)
    if (shop_name) {
      shop.shop_name = shop_name;

      // Also update the merchant's shop_name
      const merchant = await Merchant.findOne({
        where: { id: shop.merchant_id },
        transaction
      });
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
    if (is_active !== undefined) shop.is_active = is_active;

    await shop.save({ transaction });

    // 3. Update shop specifications
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

    // 4. Update categories
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
    return res.status(200).json({ message: messages.shop.SHOP_UPDATED });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};


exports.updateShopByMerchant = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { shopId } = req.params;
    const userId = req.user.id; // Set by auth middleware

    const {
      shop_name,
      description,
      categories,
      has_physical_shop,
      location,
      logo_url,
      banner_url,
      delivery_type,
      is_exchangeable
    } = req.body;

    // 1. Find the merchant associated with this user
    const merchant = await Merchant.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!merchant) {
      await transaction.rollback();
      return res.status(403).json({ message: messages.auth.UNAUTHORIZED });
    }

    // 2. Find the shop and check if it belongs to this merchant
    const shop = await Shop.findByPk(shopId, { transaction });

    if (!shop) {
      await transaction.rollback();
      return res.status(404).json({ message: messages.general.NOT_FOUND });
    }

    if (shop.merchant_id !== merchant.id) {
      await transaction.rollback();
      return res.status(403).json({ message: messages.shop.UNAUTHORIZED_SHOP }); // <-- 👈 Custom message
    }

    // 3. Update allowed fields only
    if (shop_name) {
      shop.shop_name = shop_name;
      merchant.shop_name = shop_name;
      await merchant.save({ transaction });
    }

    if (description !== undefined) shop.description = description;
    if (has_physical_shop !== undefined) shop.has_physical_shop = has_physical_shop;
    if (location !== undefined) shop.location = location;
    if (logo_url !== undefined) shop.logo_url = logo_url;
    if (banner_url !== undefined) shop.banner_url = banner_url;

    await shop.save({ transaction });

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

    // 5. Update categories
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
    return res.status(200).json({ message: messages.shop.SHOP_UPDATED });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};





exports.getShopById = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findOne({ where: { id: shopId } });

    if (!shop) {
      return res.status(404).json({ message: messages.general.NOT_FOUND });
    }

    return res.status(200).json({ data: shop });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};
// get all shops including inactive ones
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.findAll();

    return res.status(200).json({ data: shops });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};
// Get all active shops
exports.getShops = async (req, res) => {
  try {
    const shops = await Shop.findAll({
      where: { is_active: true },
    });

    return res.status(200).json({ success: true, data: shops });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: messages.general.SERVER_ERROR,
    });
  }
};

const { sequelize } = require('../models'); // import sequelize instance

exports.deleteShop = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { shopId } = req.params;

    const shop = await Shop.findOne({ where: { id: shopId }, transaction });
    if (!shop) {
      await transaction.rollback();
      return res.status(404).json({ message: messages.general.NOT_FOUND });
    }

    const merchant = await Merchant.findOne({ where: { id: shop.merchant_id }, transaction });
    if (!merchant) {
      await transaction.rollback();
      return res.status(404).json({ message: messages.auth.NOT_MERCHANT });
    }

    await User.update(
      { role: 'customer' },
      { where: { id: merchant.user_id }, transaction }
    );

    await Shop.destroy({ where: { id: shopId }, transaction });
    await Merchant.destroy({ where: { id: merchant.id }, transaction });

    await transaction.commit();
    return res.status(200).json({
      message: messages.shop.SHOP_DELETED,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Transaction failed:", error);
    return res.status(500).json({
      message: messages.general.SERVER_ERROR,
      error: error.message,
    });
  }
};

