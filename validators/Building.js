const Joi = require("joi");
const mongoose = require("mongoose");

const buildingValidationSchema = Joi.object({
  buildingName: Joi.string().trim().required().messages({
    "string.empty": "Building name is required",
  }),
  heaight: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid Heaight");
      }
      return value;
    })
    .required(),
  // user: Joi.string()
  //   .custom((value, helpers) => {
  //     if (!mongoose.Types.ObjectId.isValid(value)) {
  //       return helpers.message("Invalid User");
  //     }
  //     return value;
  //   })
  //   .optional(),
});

module.exports = { buildingValidationSchema };
