const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId Validation");

const heaightValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
  }),
  address: Joi.string().trim().required().messages({
    "string.empty": "Address is required",
  }),
  authorities: Joi.array()
    .items(
      Joi.object({
        user: objectId.required().messages({
          "any.invalid": "Invalid user ID in authorities",
          "any.required": "User ID is required in authorities",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Authorities must be an array",
      "array.min": "At least one authority must be provided",
      "any.required": "Authorities field is required",
    }),
});

module.exports = { heaightValidationSchema };
