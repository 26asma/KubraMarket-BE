const validator = require("validator");
const { MESSAGES } = require("../constants");
const { isStrongPassword } = require('../utils/passwordUtils');
function createValidationResult(errors) {
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}


exports.validateRegister = ({ name = "", email = "", password = "" }) => {
  const errors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName || trimmedName.length < 2) {
    errors.name = MESSAGES.auth.NAME_TOO_SHORT;
  }

  if (!validator.isEmail(trimmedEmail)) {
    errors.email = MESSAGES.auth.INVALID_EMAIL;
  }

  if (!isStrongPassword(password)) {
    errors.password = MESSAGES.auth.PASSWORD_WEAK;
  }

  return createValidationResult(errors);
};
exports.validateLogin = ({ email = "", password = "" }) => {
  const errors = {};

  if (!email || !validator.isEmail(email.trim())) {
    errors.email = MESSAGES.auth.INVALID_EMAIL;
  }

  if (!password || password.trim().length === 0) {
    errors.password = MESSAGES.auth.PASSWORD_REQUIRED;
  }

  return createValidationResult(errors);
};

exports.validateResetPassword = ({ newpassword = "" }) => {
  const errors = {};

  if (!isStrongPassword(newpassword)) {
    errors.newpassword = MESSAGES.auth.PASSWORD_WEAK;
  }

  return createValidationResult(errors);
};
exports.validateForgotPassword = ({ email = "" }) => {
  const errors = {};

  if (!email || !validator.isEmail(email.trim())) {
    errors.email = MESSAGES.auth.INVALID_EMAIL;
  }

  return createValidationResult(errors);
};

