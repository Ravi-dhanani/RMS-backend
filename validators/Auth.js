const Joi = require("joi");
const mongoose = require("mongoose");

const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid heaightID format");
  }
  return value;
});

const authValidationSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  profile_pic: Joi.string().uri().optional(),
  role: Joi.string()
    .required()
    .valid("USER", "ADMIN", "HEAD", "PRAMUKH")
    .messages({
      "any.required": "Role is required",
      "any.only": "Role must be either user or admin or head",
    }),
  heaightID: objectIdValidator.when("role", {
    is: Joi.valid("USER", "PRAMUKH"),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

const loginValidationSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});
module.exports = { authValidationSchema, loginValidationSchema };
