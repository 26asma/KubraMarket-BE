module.exports = (sequelize, DataTypes) => {
  const ReturnRequest = sequelize.define('ReturnRequest', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    order_item_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('requested', 'approved', 'rejected', 'refunded'),
      defaultValue: 'requested',
    },
    requested_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewed_at: {
      type: DataTypes.DATE,
    },
    refunded_at: {
      type: DataTypes.DATE,
    },
    admin_note: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'return_requests',
    timestamps: false,
  });

  ReturnRequest.associate = models => {
    ReturnRequest.belongsTo(models.OrderItem, {
      foreignKey: 'order_item_id',
      as: 'order_item'
    });
    ReturnRequest.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return ReturnRequest;
};
