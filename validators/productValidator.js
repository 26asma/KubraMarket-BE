const Joi = require('joi');

const createProductSchema = Joi.object({
  shop_id: Joi.number().required(),
  category_id: Joi.number().required(),
  title: Joi.string().max(200).required(),
  // slug: Joi.string().max(200).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().required(),
  discount_price: Joi.number().allow(null),
  stock: Joi.number().default(0),
    specification: Joi.alternatives().try(
    Joi.string(), // handle if you receive it as a stringified JSON
    Joi.array().items(
      Joi.object({
        key_name: Joi.string().required(),
        value_text: Joi.string().required()
      })
    )
  ).optional(),
});

module.exports = {
  createProductSchema,
};
