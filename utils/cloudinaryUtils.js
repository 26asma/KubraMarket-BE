const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const generateImageVariants = (publicId) => ({
//   original: cloudinary.url(publicId, { quality: 'auto' }),
//   card: cloudinary.url(publicId, { width: 400, height: 400, crop: 'fill', quality: 'auto' }),
//   detail: cloudinary.url(publicId, { width: 800, height: 800, crop: 'fill', quality: 'auto' }),
//   zoom: cloudinary.url(publicId, { width: 1600, height: 1600, crop: 'fill', quality: 'auto' }),
//   public_id: publicId
// });
const uploadImage = async (filePath, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      use_filename: true,
      unique_filename: false,
    });

    fs.unlinkSync(filePath); // ✅ Delete the local temp file
    return {
      ...generateImageVariants(result.public_id),
      secure_url: result.secure_url,
    };
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    throw err;
  }
};
const generateImageVariants = (publicId) => ({
  original: cloudinary.url(publicId, { quality: 'auto' }),
  card: cloudinary.url(publicId, { width: 400, height: 400, crop: 'fill', quality: 'auto' }),
  detail: cloudinary.url(publicId, { width: 800, height: 800, crop: 'fill', quality: 'auto' }),
  zoom: cloudinary.url(publicId, { width: 1050, height: 1200, crop: 'fill', quality: 'auto' }),
  banner: cloudinary.url(publicId, { width: 1600, height: 900, crop: 'fill', quality: 'auto' }),
  public_id: publicId
});
module.exports = {
  generateImageVariants,
  cloudinary,
  uploadImage,
};
