const Joi = require("joi");

const createMatch = Joi.object({
  mode: Joi.string().required(),
});

const updateMatch = Joi.object({
  move: Joi.string().required().valid('batu', 'gunting', 'kertas')
});

module.exports = {
  createMatch,
  updateMatch
}