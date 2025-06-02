const { RentPayment, Shop, Merchant, User } = require('../models');
const { Op, Sequelize } = require('sequelize');
const messages = require('../constants/messages');


exports.payRent = async (req, res) => {
  try {
    const rentId = req.params.id;
    const merchantId = req.merchant.id;
    const shopId = req.shop.id;

    // Find the rent payment for this shop
    const rent = await RentPayment.findOne({
      where: {
        id: rentId,
        shop_id: shopId,
        merchant_id: merchantId
      }
    });

    if (!rent) {
      return res.status(404).json({ message: 'Rent payment not found for this merchant/shop' });
    }

    // Already paid
    if (rent.payment_status === 'paid') {
      return res.status(400).json({ message: 'This rent is already marked as paid.' });
    }

    rent.payment_status = 'paid';
    rent.paid_at = new Date();

    await rent.save();

    return res.status(200).json({
      message: 'Rent marked as paid successfully',
      data: rent
    });

  } catch (error) {
    console.error('❌ Rent payment update failed:', error);
    return res.status(500).json({ message: messages.general.SERVER_ERROR, error: error.message });
  }
};


// GET /rent-payments/history
exports.getRentHistory = async (req, res) => {
  try {
    const payments = await RentPayment.findAll({
      where: {
        shop_id: req.shop.id,
        merchant_id: req.merchant.id
      },
      order: [['month_paid_for', 'DESC']]
    });

    return res.status(200).json({ data: payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};

// GET /rent-payments/due
exports.getDuePayments = async (req, res) => {
  try {
    const dues = await RentPayment.findAll({
      where: {
        shop_id: req.shop.id,
        merchant_id: req.merchant.id,
        payment_status: {
          [Op.in]: ['pending', 'late']
        }
      },
      order: [['month_paid_for', 'ASC']]
    });

    const totalDue = dues.reduce((acc, item) => acc + parseFloat(item.amount), 0);

    return res.status(200).json({ data: dues, total_due_amount: totalDue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: messages.general.SERVER_ERROR });
  }
};



// GET /admin/rent-payments/history
exports.getAllRentPayments = async (req, res) => {
  try {
    const payments = await RentPayment.findAll({
        where: {
        payment_status: 'paid'  
      },
      include: [
        {
          model: Shop,
          as: 'shop',
          attributes: ['id', 'shop_name', 'shop_id']
        },
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id'],
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        }
      ],
      order: [['month_paid_for', 'DESC']]
    });

    return res.status(200).json({ data: payments });
  } catch (err) {
    console.error('❌ Rent history fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /admin/rent-payments/due
exports.getAllDuePayments = async (req, res) => {
  try {
    const dues = await RentPayment.findAll({
      where: {
        payment_status: {
          [Op.in]: ['pending', 'late']
        }
      },
      include: [
        {
          model: Shop,
          as: 'shop',
          attributes: ['id', 'shop_name', 'shop_id']
        },
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id'],
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        }
      ],
      order: [['month_paid_for', 'ASC']]
    });

    const totalDue = dues.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    return res.status(200).json({
      total_due_amount: totalDue,
      data: dues
    });
  } catch (err) {
    console.error('❌ Due payments fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getRentPaymentsByShop = async (req, res) => {
  const { shopId } = req.params;

  try {
    const payments = await RentPayment.findAll({
      where: {
        shop_id: shopId
      },
      include: [
        {
          model: Shop,
          as: 'shop',
          attributes: ['id', 'shop_name', 'shop_id']
        },
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id'],
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        }
      ],
      order: [['month_paid_for', 'DESC']]
    });

    return res.status(200).json({ data: payments });
  } catch (err) {
    console.error('❌ Error fetching shop rent payments:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getRentSummary = async (req, res) => {
  try {
  
    // Total collected rent (sum of amounts where status is 'paid')
    const totalCollected = await RentPayment.sum('amount', {
      where: { payment_status: 'paid' }
    });

    // Total due (sum of amounts where status is 'pending' or 'late')
    const totalDue = await RentPayment.sum('amount', {
      where: {
        payment_status: ['pending', 'late']
      }
    });

    return res.status(200).json({
      total_collected: totalCollected || 0,
      total_due: totalDue || 0
    });

  } catch (error) {
    console.error('❌ Error generating rent summary:', error.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};


exports.getShopDueSummary = async (req, res) => {
  try {
    const { RentPayment, Shop } = require('../models');
    const { Op } = require('sequelize');

    const shops = await Shop.findAll({
      attributes: ['id', 'shop_name'],
      include: [
        {
          model: RentPayment,
          as: 'rent_payments',
          attributes: [],
          where: {
            payment_status: {
              [Op.in]: ['pending', 'late']
            }
          },
          required: true
        }
      ],
      group: ['Shop.id', 'shop_name'],
      raw: true,
      nest: true,
      attributes: {
        include: [
          // Sum of all due amounts per shop
          [
            Sequelize.fn('SUM', Sequelize.col('rent_payments.amount')),
            'total_due'
          ],
          // Latest due date for the shop
          [
            Sequelize.fn('MAX', Sequelize.col('rent_payments.due_date')),
            'latest_due_date'
          ]
        ]
      }
    });

    return res.status(200).json({ data: shops });
  } catch (error) {
    console.error('❌ Error generating shop due summary:', error.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};
