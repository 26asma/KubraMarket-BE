module.exports = (sequelize, DataTypes) => {
  const ProductSpecification = sequelize.define('ProductSpecification', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    key_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    value_text: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'product_specifications',
    timestamps: false
  });

  ProductSpecification.associate = models => {
    ProductSpecification.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return ProductSpecification;
};
