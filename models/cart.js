module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
    }
  }, {
    tableName: 'carts',
    timestamps: true,
    underscored: true,
  });

  Cart.associate = models => {
    Cart.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Cart.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return Cart;
};
