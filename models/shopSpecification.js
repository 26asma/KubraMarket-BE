module.exports = (sequelize, DataTypes) => {
  const ShopSpecification = sequelize.define('ShopSpecification', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shop_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    delivery_type: {
      type: DataTypes.ENUM('local', 'worldwide'),
      allowNull: false,
    },
    is_exchangeable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'shop_specifications',
    timestamps: false,
  });

  ShopSpecification.associate = (models) => {
    ShopSpecification.belongsTo(models.Shop, {
      foreignKey: 'shop_id',
      onDelete: 'CASCADE',
    });
  };

  return ShopSpecification;
};
