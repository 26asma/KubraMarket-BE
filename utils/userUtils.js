const { User } = require('../models'); // Import Sequelize User model

const findUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user || null;
};

module.exports = { findUserByEmail };
