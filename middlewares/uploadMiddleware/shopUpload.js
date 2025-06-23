const multer = require('multer');
const path = require('path');

const shopStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/shops/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});

const shopUpload = multer({
  storage: shopStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Only image files allowed!'));
  }
});

module.exports = shopUpload;
