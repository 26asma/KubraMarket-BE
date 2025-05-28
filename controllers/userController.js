const { User } = require('../models');
const messages = require('../constants/messages');
// controllers/userController.js

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // set by auth middleware
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
       return res.status(404).json({ error: messages.auth.USER_NOT_FOUND });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};
 

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: messages.auth.USER_NOT_FOUND });

    const { name, phone, address } = req.body;

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();

    // Reload user without password
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: messages.auth.PROFILE_UPDATED,
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: messages.auth.USER_NOT_FOUND});

    await user.destroy(); // <-- This will automatically set deleted_at
    res.json({ message: messages.auth.USER_DELETED });
  } catch (err) {
    next(err);
  }
};

