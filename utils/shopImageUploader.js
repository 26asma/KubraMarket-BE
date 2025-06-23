const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Ratio targets
const LOGO_DIMENSIONS = { width: 400, height: 400, crop: 'fill' };
const BANNER_DIMENSIONS = { width: 1600, height: 900, crop: 'fill' };

const uploadShopImage = async (filePath, type = 'logo') => {
  try {
    const dimensions = type === 'banner' ? BANNER_DIMENSIONS : LOGO_DIMENSIONS;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `shops/${type}`,
      transformation: [dimensions],
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });

    fs.unlinkSync(filePath); 

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const publicIdWithExtension = parts.slice(-2).join('/'); // e.g., shops/logo/image.jpg
  return publicIdWithExtension.replace(/\.[^/.]+$/, ''); // remove extension
};

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[CLOUDINARY_DELETE_ERROR]', err);
  }
};

module.exports = { uploadShopImage, deleteCloudinaryImage ,getPublicIdFromUrl };
