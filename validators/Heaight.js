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
  city: Joi.string().trim().required().messages({
    "string.empty": "City is required",
  }),
  pincode: Joi.string().trim().required().messages({
    "string.empty": "Pincode is required",
  }),
  // admin: Joi.string().optional(),
  images: Joi.array()
    .items(
      Joi.object({
        image: Joi.string().uri().required().messages({
          "string.uri": "Image must be a valid URL",
          "any.required": "Image URL is required",
        }),
        id: Joi.string().required().messages({
          "string.empty": "ID is required for each image",
        }),
      })
    )
    .optional()
    .messages({
      "array.base": "Images must be an array",
    }),
});

module.exports = { heaightValidationSchema };
