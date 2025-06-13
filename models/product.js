'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    shop_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(200),
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discount_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    thumbnail_url: {
      type: DataTypes.STRING(255)
    },
    gallery: {
      type: DataTypes.JSON // supports multiple image format structures
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'products',
    timestamps: false
  });

  Product.associate = models => {
    Product.belongsTo(models.Shop, {
      foreignKey: 'shop_id',
      as: 'shop'
    });

    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });

    Product.hasMany(models.ProductSpecification, {
      foreignKey: 'product_id',
      as: 'specifications'
    });
  };

  return Product;
};
