const { ShopMaintenanceIssue, Shop, Merchant, User } = require('../models');
const { Op } = require('sequelize');

// 📌 Merchant: Raise a maintenance issue
exports.createIssue = async (req, res) => {
  try {
    const { issue } = req.body;
    const shopId = req.shop.id;
    const merchantId = req.merchant.id;

    if (!issue || issue.trim() === '') {
      return res.status(400).json({ message: 'Issue description is required.' });
    }

    const newIssue = await ShopMaintenanceIssue.create({
      shop_id: shopId,
      merchant_id: merchantId,
      issue,
      status: 'open'
    });

    return res.status(201).json({ message: 'Issue reported successfully.', data: newIssue });
  } catch (error) {
    console.error('❌ Failed to report issue:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 📌 Merchant: View own issues
exports.getMerchantIssues = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const issues = await ShopMaintenanceIssue.findAll({
      where: { merchant_id: merchantId },
      include: {
        model: Shop,
        as: 'shop',
        attributes: ['id', 'shop_name']
      },
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ data: issues });
  } catch (error) {
    console.error('❌ Failed to fetch merchant issues:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 📌 Admin: View all issues
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await ShopMaintenanceIssue.findAll({
      include: [
        {
          model: Shop,
          as: 'shop',
          attributes: ['id', 'shop_name']
        },
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id'],
          include: {
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }
        }
      ],
      order: [['status', 'ASC'], ['created_at', 'DESC']]
    });

    return res.status(200).json({ data: issues });
  } catch (error) {
    console.error('❌ Failed to fetch all issues:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 📌 Admin: Mark issue as resolved
exports.resolveIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await ShopMaintenanceIssue.findByPk(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    if (issue.status === 'closed') {
      return res.status(400).json({ message: 'Issue is already resolved.' });
    }

    issue.status = 'closed';
    issue.resolved_at = new Date();
    await issue.save();

    return res.status(200).json({ message: 'Issue marked as resolved.', data: issue });
  } catch (error) {
    console.error('❌ Failed to resolve issue:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
