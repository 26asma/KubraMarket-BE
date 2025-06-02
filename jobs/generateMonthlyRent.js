const cron = require('node-cron');
const { Shop, RentPayment } = require('../models');
const { Op } = require('sequelize');

function getCurrentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getDueDate(monthStart) {
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), 10);
}

const generateMonthlyRent = async () => {
  console.log('📅 Generating monthly rent payments...');

  const monthPaidFor = getCurrentMonthStart();
  const dueDate = getDueDate(monthPaidFor);

  try {
    const shops = await Shop.findAll({
      where: {
        is_active: true,
        monthly_rent: { [Op.gt]: 0 }
      },
      attributes: ['id', 'merchant_id', 'monthly_rent']
    });

    for (const shop of shops) {
      const exists = await RentPayment.findOne({
        where: {
          shop_id: shop.id,
          month_paid_for: monthPaidFor
        }
      });

      if (exists) continue;

      await RentPayment.create({
        shop_id: shop.id,
        merchant_id: shop.merchant_id,
        amount: shop.monthly_rent,
        paid_at: null,
        due_date: dueDate,
        month_paid_for: monthPaidFor,
        payment_status: 'pending'
      });

      console.log(`✅ Rent created for Shop #${shop.id}`);
    }

    console.log('🎉 Monthly rent generation completed.');
  } catch (err) {
    console.error('❌ Error during rent generation:', err.message);
  }
};

module.exports = () => {
  // Runs at 12:00 AM on the 1st day of every month
  cron.schedule('0 0 1 * *', generateMonthlyRent);
};
