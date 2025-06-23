const { Shop, Merchant, User,Category,ShopSpecification,ShopCategory } = require('../models');

const { uploadShopImage, deleteCloudinaryImage } = require('../utils/shopImageUploader');
const { sequelize } = require('../models'); // ✅ import sequelize instance

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
      annual_income,
      monthly_rent,
      is_active,
      delivery_type,
      is_exchangeable
    } = req.body;

    const shop = await Shop.findByPk(shopId, { transaction });

    if (!shop) {
      await transaction.rollback();
      return res.status(404).json({ message: messages.general.NOT_FOUND });
    }

    const normalizeBoolean = (val) => ['true', 'on', '1', 1, true].includes(val);

    // 🖼️ Upload Logo
    if (req.files?.logo?.[0]) {
      const oldLogoPublicId = getPublicIdFromUrl(shop.logo_url);
      if (oldLogoPublicId) await deleteCloudinaryImage(oldLogoPublicId);

      const logoResult = await uploadShopImage(req.files.logo[0].path, 'shops/logo', {
        width: 400,
        height: 400,
        crop: 'fill'
      });
      console.log('Uploaded logo:', logoResult.secure_url);
      shop.logo_url = logoResult.secure_url;
    }

    // 🖼️ Upload Banner
    if (req.files?.banner?.[0]) {
      const oldBannerPublicId = getPublicIdFromUrl(shop.banner_url);
      if (oldBannerPublicId) await deleteCloudinaryImage(oldBannerPublicId);

      const bannerResult = await uploadShopImage(req.files.banner[0].path, 'shops/banner', {
        width: 1600,
        height: 900,
        crop: 'fill'
      });
      console.log('Uploaded banner:', bannerResult.secure_url);
      shop.banner_url = bannerResult.secure_url;
    }

    // 🔁 Update shop name
    if (shop_name) {
      shop.shop_name = shop_name;

      const merchant = await Merchant.findOne({
        where: { id: shop.merchant_id },
        transaction
      });

      if (merchant) {
        merchant.shop_name = shop_name;
        await merchant.save({ transaction });
      }
    }

    // 🔄 Update basic shop fields
    if (description !== undefined) shop.description = description;
    if (location !== undefined) shop.location = location;
    if (annual_income !== undefined) shop.annual_income = annual_income;
    if (monthly_rent !== undefined) shop.monthly_rent = monthly_rent;
    if (has_physical_shop !== undefined) shop.has_physical_shop = normalizeBoolean(has_physical_shop);
    if (is_active !== undefined) shop.is_active = normalizeBoolean(is_active);

    await shop.save({ transaction });

    // 📦 Update specifications
    if (delivery_type || is_exchangeable !== undefined) {
      const [spec, created] = await ShopSpecification.findOrCreate({
        where: { shop_id: shop.id },
        defaults: {
          delivery_type,
          is_exchangeable: normalizeBoolean(is_exchangeable)
        },
        transaction
      });

      if (!created) {
        if (delivery_type !== undefined) spec.delivery_type = delivery_type;
        if (is_exchangeable !== undefined) spec.is_exchangeable = normalizeBoolean(is_exchangeable);
        await spec.save({ transaction });
      }
    }

    // 📂 Update categories
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
    console.error('[ADMIN_SHOP_UPDATE_ERROR]', error);
    return res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};


exports.updateShopByMerchant = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { shopId } = req.params;
    const userId = req.user.id;

    const {
      shop_name,
      description,
      categories,
      has_physical_shop,
      location,
      delivery_type,
      is_exchangeable
    } = req.body || {};

    const merchant = await Merchant.findOne({ where: { user_id: userId }, transaction });
    if (!merchant) {
      await transaction.rollback();
      return res.status(403).json({ message: messages.auth.UNAUTHORIZED });
    }

    const shop = await Shop.findByPk(shopId, { transaction });
    if (!shop || shop.merchant_id !== merchant.id) {
      await transaction.rollback();
      return res.status(403).json({ message: messages.shop.UNAUTHORIZED_SHOP });
    }

    // Upload logo if provided
    if (req.files?.logo?.[0]) {
      const result = await uploadShopImage(req.files.logo[0].path, 'logo');
      shop.logo_url = result.secure_url;
    }

    // Upload banner if provided
    if (req.files?.banner?.[0]) {
      const result = await uploadShopImage(req.files.banner[0].path, 'banner');
      shop.banner_url = result.secure_url;
    }

    // Update text fields
    if (shop_name) {
      shop.shop_name = shop_name;
      merchant.shop_name = shop_name;
      await merchant.save({ transaction });
    }

    if (description !== undefined) shop.description = description;
    if (location !== undefined) shop.location = location;
    if (has_physical_shop !== undefined) shop.has_physical_shop = ['true', 'on', 1, true].includes(has_physical_shop);

    await shop.save({ transaction });

    // Update specs
    if (delivery_type || is_exchangeable !== undefined) {
      const [spec, created] = await ShopSpecification.findOrCreate({
        where: { shop_id: shop.id },
        defaults: { delivery_type, is_exchangeable },
        transaction
      });

      if (!created) {
        if (delivery_type !== undefined) spec.delivery_type = delivery_type;
        if (is_exchangeable !== undefined)
          spec.is_exchangeable = ['true', 'on', 1, true].includes(is_exchangeable);
        await spec.save({ transaction });
      }
    }

    // Update categories
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

        await ShopCategory.create({ shop_id: shop.id, category_id: category.id }, { transaction });
      }
    }

    await transaction.commit();
    return res.status(200).json({ message: messages.shop.SHOP_UPDATED });

  } catch (error) {
    await transaction.rollback();
    console.error('[UPDATE_SHOP_BY_MERCHANT_ERROR]', error);
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


const { getPublicIdFromUrl} = require('../utils/shopImageUploader');
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

    // 🧼 Delete Cloudinary images
    const logoPublicId = getPublicIdFromUrl(shop.logo_url);
    const bannerPublicId = getPublicIdFromUrl(shop.banner_url);

    if (logoPublicId) await deleteCloudinaryImage(logoPublicId);
    if (bannerPublicId) await deleteCloudinaryImage(bannerPublicId);

    // 👤 Demote user role
    await User.update(
      { role: 'customer' },
      { where: { id: merchant.user_id }, transaction }
    );

    // 🗑️ Delete Shop and Merchant
    await Shop.destroy({ where: { id: shopId }, transaction });
    await Merchant.destroy({ where: { id: merchant.id }, transaction });

    await transaction.commit();
    return res.status(200).json({ message: messages.shop.SHOP_DELETED });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Transaction failed:', error);
    return res.status(500).json({
      message: messages.general.SERVER_ERROR,
      error: error.message,
    });
  }
};

