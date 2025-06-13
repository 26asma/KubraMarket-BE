const { Product, ProductSpecification , Category ,Shop } = require('../models');
const { cloudinary, generateImageVariants } = require('../utils/cloudinaryUtils');
const MESSAGES = require('../constants/messages');
const fs = require('fs/promises');
const slugify = require('slugify');

exports.createProduct = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const {
      category_id,
      title,
      description,
      price,
      discount_price,
      stock,
    } = req.body;

    const shop = await Shop.findOne({
      where: { merchant_id: merchantId },
    });

    if (!shop) {
      return res.status(403).json({
        message: MESSAGES.products.UNAUTHORIZED_SHOP_ACCESS,
      });
    }

    const slug = slugify(title || req.body.slug, { lower: true, strict: true });
    const specifications = req.body.specifications
      ? JSON.parse(req.body.specifications)
      : [];

    const files = req.files || [];
    const imageGallery = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `products/${slug}`,
      });
      const variants = generateImageVariants(result.public_id);
      imageGallery.push(variants);
      await fs.unlink(file.path);
    }

    const thumbnail_url = imageGallery[0]?.card || null;

    const product = await Product.create({
      shop_id: shop.id,
      category_id,
      title,
      slug,
      description,
      price,
      discount_price,
      stock,
      thumbnail_url,
      gallery: imageGallery,
    });

    if (specifications.length > 0) {
      const specData = specifications.map(spec => ({
        product_id: product.id,
        key_name: spec.key_name,
        value_text: spec.value_text,
      }));
      await ProductSpecification.bulkCreate(specData);
    }

    return res.status(201).json({
      message: MESSAGES.products.PRODUCT_CREATED,
      product,
    });
  } catch (error) {
    console.error('[Create Product Error]', error);
    return res.status(500).json({
      message: MESSAGES.products.CREATION_FAILED,
    });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Shop, as: 'shop' }]
    });

    if (!product || product.shop.merchant_id !== merchantId) {
      return res.status(403).json({
        message: MESSAGES.products.UNAUTHORIZED_PRODUCT_ACCESS,
      });
    }

    const {
      title,
      description,
      price,
      discount_price,
      stock,
      category_id,
    } = req.body;

    const specifications = req.body.specifications
      ? JSON.parse(req.body.specifications)
      : [];

    let imageGallery = product.gallery || [];
    const files = req.files;

    if (files && files.length > 0) {
      imageGallery = [];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `products/${product.slug}`,
        });
        const variants = generateImageVariants(result.public_id);
        imageGallery.push(variants);
        await fs.unlink(file.path);
      }
    }

    const slug = slugify(title || product.title, { lower: true, strict: true });

    await product.update({
      title,
      slug,
      description,
      price,
      discount_price,
      stock,
      category_id,
      gallery: imageGallery,
      thumbnail_url: imageGallery[0]?.card || product.thumbnail_url,
    });

    if (specifications.length > 0) {
      await ProductSpecification.destroy({ where: { product_id: product.id } });
      const specData = specifications.map(spec => ({
        product_id: product.id,
        key_name: spec.key_name,
        value_text: spec.value_text,
      }));
      await ProductSpecification.bulkCreate(specData);
    }

    return res.status(200).json({
      message: MESSAGES.products.updated,
      product,
    });
  } catch (error) {
    console.error('[Update Product Error]', error);
    return res.status(500).json({
      message: MESSAGES.products.update_failed,
    });
  }
};



exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: ProductSpecification, as: 'specifications' },
        { model: Category, attributes: ['id', 'name'], as: 'category' },
        { model: Shop, attributes: ['id', 'shop_name'], as: 'shop' }
      ],
   order: [['created_at', 'DESC']]

    });

    return res.status(200).json({
      message: MESSAGES.products.fetched_all,
      products,
    });
  } catch (error) {
    console.error('[Get All Products Error]', error);
    return res.status(500).json({
      message: MESSAGES.products.fetch_failed,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: ProductSpecification, as: 'specifications' },
        { model: Category, attributes: ['id', 'name'], as: 'category' },
        { model: Shop, attributes: ['id', 'shop_name'], as: 'shop' }
      ],
    });

    if (!product) {
      return res.status(404).json({
        message: MESSAGES.products.not_found,
      });
    }

    return res.status(200).json({
      message: MESSAGES.products.fetched_one,
      product,
    });
  } catch (error) {
    console.error('[Get Product By ID Error]', error);
    return res.status(500).json({
      message: MESSAGES.products.fetch_failed,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Shop, as: 'shop' }]
    });

    if (!product || product.shop.merchant_id !== merchantId) {
      return res.status(403).json({
        message: MESSAGES.products.UNAUTHORIZED_PRODUCT_ACCESS,
      });
    }

    if (product.gallery && Array.isArray(product.gallery)) {
      for (const image of product.gallery) {
        if (image?.card) {
          const publicId = image.card.split('/').pop().split('.')[0];
          try {
            await cloudinary.uploader.destroy(`products/${product.slug}/${publicId}`);
          } catch (err) {
            console.warn('Cloudinary delete failed:', publicId, err.message);
          }
        }
      }
    }

    await ProductSpecification.destroy({ where: { product_id: id } });
    await product.destroy();

    return res.status(200).json({
      message: MESSAGES.products.deleted,
    });
  } catch (error) {
    console.error('[Delete Product Error]', error);
    return res.status(500).json({
      message: MESSAGES.products.delete_failed,
    });
  }
};



exports.getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const products = await Product.findAll({
      where: { shop_id: shopId },
      include: [
        {
          model: ProductSpecification,
          as: 'specifications',
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Shop,
          as: 'shop',
          attributes: ['id', 'shop_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: MESSAGES.products.fetched,
      data: products
    });
  } catch (error) {
    console.error('[Get Products by Shop Error]', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.general.SERVER_ERROR
    });
  }
};
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.findAll({
      where: { category_id: categoryId },
      include: [
        {
          model: ProductSpecification,
          as: 'specifications',
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Shop,
          as: 'shop',
          attributes: ['id', 'shop_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: MESSAGES.products.fetched,
      data: products
    });
  } catch (error) {
    console.error('[Get Products by Category Error]', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.general.SERVER_ERROR
    });
  }
};