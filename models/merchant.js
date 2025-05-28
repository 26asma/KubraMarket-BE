'use strict';

module.exports = (sequelize, DataTypes) => {
  const Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    shop_id: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    shop_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    }
  }, {
    tableName: 'merchants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Merchant.associate = models => {
    Merchant.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    Merchant.hasOne(models.Shop, {
      foreignKey: 'merchant_id',
      as: 'shop'
    });
  };

  return Merchant;
};
