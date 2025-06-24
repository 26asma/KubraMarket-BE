module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
      defaultValue: 'unpaid',
    },
    payment_method: {
      type: DataTypes.STRING(50),
    },
    placed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'orders',
    timestamps: false
  });

  Order.associate = models => {
    Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
    Order.hasOne(models.ShippingAddress, { foreignKey: 'order_id', as: 'shipping_address' });
    Order.hasOne(models.Payment, { foreignKey: 'order_id', as: 'payment' });
  };

  return Order;
};
