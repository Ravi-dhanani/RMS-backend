const Joi = require("joi");
const mongoose = require("mongoose");

// Custom ObjectId validator
const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid heaightID format");
  }
  return value;
}, "ObjectId Validator");

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

// Helper function to detect if the user is a "USER-type"
const isUserType = (role) => {
  return role === "USER";
};

// Main schema
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
  role: Joi.string().required().valid("USER", "ADMIN").messages({
    "any.required": "Role is required",
    "any.only": "Role must be USER or ADMIN",
  }),

  profile_pic: Joi.any().custom((value, helpers) => {
    const { role } = helpers?.state?.ancestors?.[0] || {};

    const isUserType = role === "USER";

    if (isUserType) {
      if (!value) {
        return helpers.error("any.required", {
          label: "Profile picture is required for this role",
        });
      }

      // Validate using the defined profilePicSchema
      const { error } = profilePicSchema.validate(value, { abortEarly: true });
      if (error) {
        return helpers.message(error.details[0].message);
      }
    }

    return value;
  }),

  heaightID: objectIdValidator.optional(),

  familyMembers: Joi.any().custom((value, helpers) => {
    const { role } = helpers?.state?.ancestors?.[0] || {};
    if (isUserType(role)) {
      if (!Array.isArray(value) || value.length === 0) {
        return helpers.message(
          "Family members are required for USER-type roles"
        );
      }
      const { error } = Joi.array().items(familyMemberSchema).validate(value);
      if (error) return helpers.message("Invalid family member details");
    }
    return value;
  }),

  businessDetails: Joi.any().custom((value, helpers) => {
    const { role } = helpers?.state?.ancestors?.[0] || {};
    if (isUserType(role)) {
      if (!Array.isArray(value) || value.length === 0) {
        return helpers.message(
          "Business details are required for USER-type roles"
        );
      }
      const { error } = Joi.array().items(businessDetailSchema).validate(value);
      if (error) return helpers.message("Invalid business detail");
    }
    return value;
  }),

  vehicleDetails: Joi.any().custom((value, helpers) => {
    const { role } = helpers?.state?.ancestors?.[0] || {};
    if (isUserType(role)) {
      if (!Array.isArray(value) || value.length === 0) {
        return helpers.message(
          "Vehicle details are required for USER-type roles"
        );
      }
      const { error } = Joi.array().items(vehicleDetailSchema).validate(value);
      if (error) return helpers.message("Invalid vehicle detail");
    }
    return value;
  }),
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
