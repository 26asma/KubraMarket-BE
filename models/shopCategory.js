'use strict';
module.exports = (sequelize, DataTypes) => {
  const ShopCategory = sequelize.define('ShopCategory', {
    shop_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    }
  }, {
    tableName: 'shop_categories',
    timestamps: false,
    underscored: true,
  });

  return ShopCategory;
};
