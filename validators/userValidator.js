const Joi = require("joi");

const createUserSchema = Joi.object({
  fullname: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(20).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(20).required(),
});

const updateAvatarSchema = Joi.object({
  avatar_id: Joi.number().required()
});

module.exports = {
  createUserSchema,
  loginSchema,
  updateAvatarSchema,
}