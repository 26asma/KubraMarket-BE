// models/rent_payments.js
module.exports = (sequelize, DataTypes) => {
  const RentPayment = sequelize.define('RentPayment', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    shop_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    merchant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paid_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    month_paid_for: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    due_date: {
  type: DataTypes.DATEONLY,
  allowNull: false
},

    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'late'),
      defaultValue: 'pending',
    },
     payment_method: {
      type: DataTypes.ENUM('offline', 'upi', 'netbanking', 'card'),
      defaultValue: 'offline',
    }
  }, {
    tableName: 'rent_payments',
    timestamps: false
  });

  RentPayment.associate = models => {
    RentPayment.belongsTo(models.Shop, {
      foreignKey: 'shop_id',
      as: 'shop'
    });

    RentPayment.belongsTo(models.Merchant, {
      foreignKey: 'merchant_id',
      as: 'merchant'
    });
  };

  return RentPayment;
};
