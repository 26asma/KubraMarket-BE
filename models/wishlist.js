module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
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
    }
  }, {
    tableName: 'wishlists',
    timestamps: true,
    underscored: true,
  });

  Wishlist.associate = models => {
    Wishlist.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Wishlist.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return Wishlist;
};
