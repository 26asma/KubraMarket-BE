module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define('ProductVariant', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    variant_label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    variant_sku: {
      type: DataTypes.STRING,
      unique: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'product_variants',
    underscored: true,
    timestamps: true,
  });

  ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });
  };

  return ProductVariant;
};
