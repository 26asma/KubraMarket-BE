// utils/passwordUtils.js
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

exports.isStrongPassword = (password) => strongPasswordRegex.test(password);
exports.hashPassword = async (password) => {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};