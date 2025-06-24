module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    variant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
    }
  }, {
    tableName: 'order_items',
    timestamps: false
  });

  OrderItem.associate = models => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    OrderItem.belongsTo(models.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
  };

  return OrderItem;
};
