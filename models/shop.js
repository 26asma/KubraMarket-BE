'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Shop extends Model {
    static associate(models) {
      Shop.belongsTo(models.Merchant, {
        foreignKey: 'merchant_id',
        as: 'merchant',
      });

      // Many-to-Many → Shop ↔ Categories
      Shop.belongsToMany(models.Category, {
        through: 'shop_categories',
        foreignKey: 'shop_id',
        otherKey: 'category_id',
        as: 'categories',
      });

      Shop.hasOne(models.ShopSpecification, {
        foreignKey: 'shop_id',
        as: 'specification',
      });
Shop.hasMany(models.RentPayment, { foreignKey: 'shop_id', as: 'rent_payments' });

      // Shop.hasMany(models.Product, {
      //   foreignKey: 'shop_id',
      //   as: 'products',
      // });

      // Add more associations as needed
    }
  }

  Shop.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    shop_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    merchant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    shop_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    has_physical_shop: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    location: {
      type: DataTypes.STRING(255),
    },
    logo_url: {
      type: DataTypes.STRING(255),
    },
    banner_url: {
      type: DataTypes.STRING(255),
    },
    annual_income: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    monthly_rent: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: false,
  defaultValue: 0.00
},

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Shop',
    tableName: 'shops',
    underscored: true,
    timestamps: true,
    // paranoid: true,
  });

  return Shop;
};
