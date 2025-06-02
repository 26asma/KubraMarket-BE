const cron = require('node-cron');
const { RentPayment } = require('../models');
const { Op } = require('sequelize');

const markLateRent = async () => {
  const today = new Date();
  console.log('⏳ Checking for overdue rent payments...');

  try {
    const result = await RentPayment.update(
      { payment_status: 'late' },
      {
        where: {
          payment_status: 'pending',
          due_date: { [Op.lt]: today }
        }
      }
    );

    console.log(`📌 Marked ${result[0]} payments as 'late'.`);
  } catch (err) {
    console.error('❌ Error while marking late payments:', err.message);
  }
};

module.exports = () => {
  // Run daily at 1:00 AM
  cron.schedule('0 1 * * *', markLateRent);
};
