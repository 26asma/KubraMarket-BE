module.exports = (sequelize, DataTypes) => {
  const ShippingAddress = sequelize.define('ShippingAddress', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    recipient_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_line2: {
      type: DataTypes.STRING(255),
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    shipping_method: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    shipping_status: {
      type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    tracking_number: {
      type: DataTypes.STRING(100),
    },
    shipped_at: {
      type: DataTypes.DATE,
    },
    delivered_at: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'shipping_addresses',
    timestamps: false,
  });

  ShippingAddress.associate = models => {
    ShippingAddress.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });
  };

  return ShippingAddress;
};
