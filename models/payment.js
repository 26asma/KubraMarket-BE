module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    paid_at: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'payments',
    timestamps: false,
  });

  Payment.associate = models => {
    Payment.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });
  };

  return Payment;
};
