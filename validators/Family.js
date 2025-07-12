const Joi = require("joi");

const familyMemberSchema = Joi.object({
  name: Joi.string().required(),
  relation: Joi.string().required(),
  age: Joi.number().optional(),
  occupation: Joi.string().optional(),
  contactNo: Joi.string().optional(),
});

const familyMembersArraySchema = Joi.array().items(familyMemberSchema).min(1);

module.exports = { familyMemberSchema, familyMembersArraySchema };
