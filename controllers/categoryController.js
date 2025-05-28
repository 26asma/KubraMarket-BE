const { Category,Shop } = require('../models');
const Messages = require('../constants/messages');

const slugify = require('slugify'); 


// Add Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true });

    const category = await Category.create({ name, slug, description });
    res.status(201).json({ success: true, data: category ,message: Messages.category.CATEGORY_CREATED });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false,message: Messages.general.SERVER_ERROR });
  }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: Messages.general.SERVER_ERROR });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true });

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: Messages.category.NOT_FOUND });

    category.name = name;
    category.slug = slug;
    category.description = description;
    await category.save();

    res.json({ success: true, data: category, message: Messages.category.CATEGORY_UPDATED });
  } catch (err) {
    res.status(400).json({ success: false, message: Messages.general.SERVER_ERROR });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: Messages.category.NOT_FOUND });

    await category.destroy();
    res.json({ success: true, message: Messages.category.CATEGORY_DELETED });
  } catch (err) {
    res.status(400).json({ success: false, message: Messages.general.SERVER_ERROR });
  }
};

exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ where: { slug } });

    if (!category) {
      return res.status(404).json({ success: false, message:Messages.category.NOT_FOUND });
    }

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: Messages.general.SERVER_ERROR });
  }
};

exports.getShopsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug },
      include: [{
        model: Shop,
        as: 'shops',
        through: { attributes: [] } // Exclude join table attributes
      }]
    });

    if (!category) {
      return res.status(404).json({ success: false, message: Messages.category.NOT_FOUND });
    }

    return res.status(200).json({ success: true, data: category.shops });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: Messages.general.SERVER_ERROR });
  }
}
exports.getCategoriesForShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findByPk(shopId, {
      include: {
        model: Category,
        as: 'categories',
        through: { attributes: [] }, // exclude junction table
        attributes: ['id', 'name', 'slug', 'icon_url', 'description', 'is_active'],
      },
    });

    if (!shop) {
      return res.status(404).json({ success: false, message: messages.general.NOT_FOUND });
    }

    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully.',
      data: shop.categories,
    });
  } catch (error) {
    console.error('Error fetching categories for shop:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};