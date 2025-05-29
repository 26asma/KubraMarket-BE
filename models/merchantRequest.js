'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MerchantRequest extends Model {
    static associate(models) {
      MerchantRequest.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      MerchantRequest.belongsTo(models.User, {
        foreignKey: 'reviewed_by',
        as: 'reviewer',
      });
    }
  }

  MerchantRequest.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    shop_name: { type: DataTypes.STRING(150), allowNull: false },
    shop_description: DataTypes.TEXT,
    category: DataTypes.STRING(100),
    has_physical_shop: { type: DataTypes.BOOLEAN, defaultValue: false },
    shop_location: DataTypes.TEXT,
    reason: DataTypes.TEXT,
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    admin_note: DataTypes.TEXT,
    reviewed_by: DataTypes.INTEGER,
    requested_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    reviewed_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'MerchantRequest',
    tableName: 'merchant_requests',
    timestamps: false,
  });

  return MerchantRequest;
};
