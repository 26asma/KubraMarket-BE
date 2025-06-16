
const { Op } = require('sequelize');
const { MerchantRequest, User, Merchant, Shop, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const messages = require('../constants/messages');


exports.createRequest = async (req, res) => {
  try {
    const {
      shop_name,
      shop_description,
      category,
      has_physical_shop,
      shop_location,
      reason
    } = req.body;

    const newRequest = await MerchantRequest.create({
      user_id: req.user.id,
      shop_name,
      shop_description,
      category,
      has_physical_shop,
      shop_location,
      reason
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: messages.general.SERVER_ERROR });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MerchantRequest.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: messages.general.SERVER_ERROR });
  }
};

exports.updateStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    const request = await MerchantRequest.findByPk(id, { transaction });

    if (!request) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: messages.general.NOT_FOUND });
    }

    const previousStatus = request.status;
    const user = await User.findByPk(request.user_id, { transaction });

    // ✅ Update status and audit
    request.status = status;
    request.admin_note = admin_note;
    request.reviewed_by = req.user.id;
    request.reviewed_at = new Date();
    await request.save({ transaction });

    if (previousStatus !== 'approved' && status === 'approved') {
      // ✅ Promote to merchant and create records
      if (user.role !== 'merchant') {
        user.role = 'merchant';
        await user.save({ transaction });
      }

      let merchant = await Merchant.findOne({ where: { user_id: user.id }, transaction });
      if (!merchant) {
        const shopId = `SHOP-${uuidv4().slice(0, 4).toUpperCase()}`;
        merchant = await Merchant.create({
          user_id: user.id,
          shop_id: shopId,
          shop_name: request.shop_name,
        }, { transaction });

        await Shop.create({
          merchant_id: merchant.id,
          shop_id: shopId,
          shop_name: request.shop_name,
          description: request.shop_description || 'Welcome to your new shop!',
          category: request.category || 'general',
          has_physical_shop: request.has_physical_shop || false,
          location: request.shop_location || '',
          logo_url: '',
          banner_url: '',
          annual_income: 0.0,
          is_active: false,
        }, { transaction });
      }

    } else if (previousStatus === 'approved' && status !== 'approved') {
      // ✅ Rollback merchant/shop creation and revert user role
      const merchant = await Merchant.findOne({ where: { user_id: user.id }, transaction });

      if (merchant) {
        await Shop.destroy({ where: { merchant_id: merchant.id }, transaction });
        await merchant.destroy({ transaction });

        // Revert user role only if no other merchant record exists
        const otherMerchant = await Merchant.findOne({
          where: { user_id: user.id },
          transaction
        });

        if (!otherMerchant) {
          user.role = 'user';
          await user.save({ transaction });
        }
      }
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: messages.general.ACTION_SUCCESS,
      data: request,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("❌ updateStatus failed:", err);
    return res.status(500).json({
      success: false,
      message: messages.general.SERVER_ERROR,
      error: err.message,
    });
  }
};

 exports.getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
    
        const request = await MerchantRequest.findByPk(id, {
        include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] }
        ]
        });
    
        if (!request) {
        return res.status(404).json({ success: false, message: messages.general.NOT_FOUND });
        }
    
        res.status(200).json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, message:messages.general.SERVER_ERROR, error: err.message });
    }}

    exports.getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: messages.general.BAD_REQUEST });
    }

    const requests = await MerchantRequest.findAll({
      where: { status },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: messages.general.SERVER_ERROR, error: err.message });
  }
};
