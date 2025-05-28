module.exports = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admins only.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};
