const Joi = require("joi");
const mongoose = require("mongoose");

const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid heaightID format");
  }
  return value;
});
const allowedRolesForExtraDetails = Joi.valid("PRAMUKH", "HEAD");

const familyMemberSchema = Joi.object({
  name: Joi.string().required(),
  relation: Joi.string().required(),
  age: Joi.number().optional(),
  occupation: Joi.string().optional(),
  contactNo: Joi.string().optional(),
});

const businessDetailSchema = Joi.object({
  businessName: Joi.string().required(),
  type: Joi.string().optional(),
  ownerName: Joi.string().optional(),
  address: Joi.string().optional(),
  contactNo: Joi.string().optional(),
  gstNo: Joi.string().optional(),
});

const vehicleDetailSchema = Joi.object({
  vehicleType: Joi.string().required(),
  vehicleNo: Joi.string().required(),
});
const profilePicSchema = Joi.object({
  image: Joi.string().uri().required().messages({
    "string.uri": "Image must be a valid URI",
    "any.required": "Image URL is required",
  }),
  id: Joi.string().required().messages({
    "any.required": "Image ID is required",
  }),
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
  profile_pic: Joi.when("role", {
    is: Joi.valid("USER", "PRAMUKH", "HEAD"),
    then: profilePicSchema.required().messages({
      "any.required": "Profile picture is required for this role",
    }),
    otherwise: Joi.forbidden(),
  }),
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
  familyMembers: Joi.when("role", {
    is: Joi.valid("USER", "PRAMUKH", "HEAD"),
    then: Joi.array().items(familyMemberSchema).required().messages({
      "any.required": "Family members are required for this role",
      "array.base": "Family members must be an array",
    }),
    otherwise: Joi.forbidden(),
  }),

  businessDetails: Joi.when("role", {
    is: Joi.valid("USER", "PRAMUKH", "HEAD"),

    then: Joi.array().items(businessDetailSchema).required().messages({
      "any.required": "Business details are required for this role",
      "array.base": "Business details must be an array",
    }),
    otherwise: Joi.forbidden(),
  }),

  vehicleDetails: Joi.when("role", {
    is: Joi.valid("USER", "PRAMUKH", "HEAD"),
    then: Joi.array().items(vehicleDetailSchema).required().messages({
      "any.required": "Vehicle details are required for this role",
      "array.base": "Vehicle details must be an array",
    }),
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
