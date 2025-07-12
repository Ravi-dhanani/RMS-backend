const Joi = require("joi");

const vehicleDetailSchema = Joi.object({
  vehicleType: Joi.string().required(),
  vehicleNo: Joi.string().required(),
});

const vehicleDetailsArraySchema = Joi.array().items(vehicleDetailSchema).min(1);

module.exports = { vehicleDetailSchema, vehicleDetailsArraySchema };
