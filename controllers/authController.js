const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Sequelize model
const sendEmail = require('../services/sendEmail');
const MESSAGES = require('../constants/messages');
const { validateRegister, validateLogin, validateResetPassword } = require('../validators/authValidator');
const { hashPassword } = require('../utils/passwordUtils');

// Helper to create error with status
function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}


exports.register = async (req, res, next) => {
  const { isValid, errors } = validateRegister(req.body);
  if (!isValid) return res.status(400).json({ errors });

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({
      where: { email },
      paranoid: false
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        // If soft-deleted, restore and update
        await existingUser.restore();
        existingUser.name = name;
        existingUser.password = await hashPassword(password);
        await existingUser.save();
        return res.status(200).json({ message: MESSAGES.auth.ACCOUNT_RESTORED});
      }
      return next(createError(409, MESSAGES.auth.EMAIL_EXISTS));
    }

    const hashedPassword = await hashPassword(password);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ msg: MESSAGES.auth.REGISTER_SUCCESS });
  } catch (error) {
    next(createError(500, error.message || MESSAGES.general.SERVER_ERROR));
  }
};

exports.login = async (req, res, next) => {
  const { isValid, errors } = validateLogin(req.body);
  if (!isValid) return res.status(400).json(errors);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return next(createError(404, MESSAGES.auth.USER_NOT_FOUND));

    const match = await bcrypt.compare(password, user.password);
    if (!match) return next(createError(401, MESSAGES.auth.INVALID_CREDENTIALS));

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (error) {
    next(createError(500, error.message || MESSAGES.general.SERVER_ERROR));
  }
};

// exports.login = async (req, res, next) => {
//   const { isValid, errors } = validateLogin(req.body);
//   if (!isValid) return res.status(400).json(errors);

//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({
//       where: { email },
//       paranoid: false // include soft-deleted users in query
//     });

//     if (!user || user.deletedAt) {
//       return next(createError(404, MESSAGES.auth.USER_NOT_FOUND));
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return next(createError(401, MESSAGES.auth.INVALID_CREDENTIALS));

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       token,
//       user: { id: user.id, name: user.name, role: user.role }
//     });
//   } catch (error) {
//     next(createError(500, error.message || MESSAGES.general.SERVER_ERROR));
//   }
// };


exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return next(createError(404, MESSAGES.auth.USER_NOT_FOUND));

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/api/auth/reset-password/${token}`;

    await sendEmail(email, 'Password Reset', `Click to reset: ${resetLink}`);
    res.json({ msg: MESSAGES.auth.RESET_LINK_SENT });
  } catch (error) {
    next(createError(500, error.message || MESSAGES.general.SERVER_ERROR));
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newpassword } = req.body;

  const { isValid, errors } = validateResetPassword({ newpassword });
  if (!isValid) return res.status(400).json(errors);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await hashPassword(newpassword);

    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { id: decoded.id } }
    );

    if (!updated) {
      return next(createError(404, MESSAGES.auth.USER_NOT_FOUND));
    }

    res.json({ msg: MESSAGES.auth.PASSWORD_RESET_SUCCESS });
  } catch (err) {
    next(createError(400, MESSAGES.auth.INVALID_OR_EXPIRED_TOKEN));
  }
};
