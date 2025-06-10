const Joi = require("joi");
const mongoose = require("mongoose");

// Custom ObjectId validator
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
});

const flatValidationSchema = Joi.object({
  flatName: Joi.string().trim().required().messages({
    "string.empty": "Flat name is required",
  }),

  flourId: objectId.required().messages({
    "any.required": "Flour ID is required",
  }),

  isBooked: Joi.string()
    .valid("Booked", "UnBooked")
    .default("UnBooked")
    .messages({
      "any.only": 'isBooked must be either "Booked" or "UnBooked"',
    }),
  currentMember: objectId
    .messages({
      "any.required": "Current Member is required",
    })
    .optional(),
});

module.exports = { flatValidationSchema };
