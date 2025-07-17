const Joi = require("joi");
const mongoose = require("mongoose");

// Custom ObjectId validator
const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid heaightID format");
  }
  return value;
}, "ObjectId Validator");

// User (auth) validation schema
const authValidationSchema = Joi.object({
  name: Joi.string().required(),
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
  role: Joi.string()
    .required()
    .valid("USER", "ADMIN", "PRAMUKH", "MAIN_PRAMUKH")
    .messages({
      "any.required": "Role is required",
      "any.only": "Invalid role provided",
    }),
  profile_pic: Joi.object({
    image: Joi.string().uri().required().messages({
      "string.uri": "Image must be a valid URI",
      "any.required": "Image URL is required",
    }),
    id: Joi.string().required().messages({
      "any.required": "Image ID is required",
    }),
  }).optional(),

  heaightID: objectIdValidator.when("role", {
    not: Joi.valid("ADMIN"),
    then: Joi.required().messages({
      "any.required": "Height ID is required for this role",
    }),
    otherwise: Joi.optional(),
  }),

  buildingID: objectIdValidator.when("role", {
    not: Joi.valid("ADMIN"),
    then: Joi.required().messages({
      "any.required": "Building ID is required for this role",
    }),
    otherwise: Joi.optional(),
  }),
  flourID: objectIdValidator.when("role", {
    not: Joi.valid("ADMIN"),
    then: Joi.required().messages({
      "any.required": "Flour ID is required for this role",
    }),
    otherwise: Joi.optional(),
  }),
  flatID: objectIdValidator.when("role", {
    not: Joi.valid("ADMIN"),
    then: Joi.required().messages({
      "any.required": "Flat ID is required for this role",
    }),
    otherwise: Joi.optional(),
  }),

  familyMembers: Joi.array().optional(), // just to ensure it's an array
  businessDetails: Joi.array().optional(),
  vehicleDetails: Joi.array().optional(),
});

// Login Schema
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
