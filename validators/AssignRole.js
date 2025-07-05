// validators/assignRole.js
const Joi = require("joi");
const mongoose = require("mongoose");

const objectIdValidator = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid ObjectId format");
    }
    return value;
}, "ObjectId Validation");

const assignRoleSchema = Joi.object({
    user: objectIdValidator.required(),
    height: objectIdValidator.required(),
    role: Joi.string().valid("HEAD", "PRAMUKH").required(),
});

module.exports = { assignRoleSchema };
