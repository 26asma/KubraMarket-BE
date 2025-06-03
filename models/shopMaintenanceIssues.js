module.exports = (sequelize, DataTypes) => {
  const ShopMaintenanceIssue = sequelize.define('ShopMaintenanceIssue', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    shop_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    issue: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'closed'),
      defaultValue: 'open'
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'shop_maintenance_issues',
    underscored: true,
    timestamps: true
  });

  ShopMaintenanceIssue.associate = (models) => {
    ShopMaintenanceIssue.belongsTo(models.Shop, {
      foreignKey: 'shop_id',
      as: 'shop'
    });

    ShopMaintenanceIssue.belongsTo(models.Merchant, {
      foreignKey: 'merchant_id',
      as: 'merchant'
    });
  };

  return ShopMaintenanceIssue;
};
