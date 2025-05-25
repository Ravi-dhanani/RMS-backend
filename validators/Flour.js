const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId Validation");

const flourSchema = Joi.object({
  flourName: Joi.string().trim().required().messages({
    "string.empty": "Flour name is required",
    "any.required": "Flour name is required",
  }),

  buildingId: objectId.required().messages({
    "any.invalid": "Building ID must be a valid ObjectId",
    "string.empty": "Building ID is required",
    "any.required": "Building ID is required",
  }),
});

module.exports = { flourSchema };
