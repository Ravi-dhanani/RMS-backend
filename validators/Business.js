const Joi = require("joi");

const businessDetailSchema = Joi.object({
  businessName: Joi.string().required(),
  type: Joi.string().optional(),
  ownerName: Joi.string().optional(),
  address: Joi.string().optional(),
  contactNo: Joi.string().optional(),
  gstNo: Joi.string().optional(),
});

const businessDetailsArraySchema = Joi.array()
  .items(businessDetailSchema)
  .min(1);

module.exports = { businessDetailSchema, businessDetailsArraySchema };
