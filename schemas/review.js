const Joi = require("joi");

// module exports = langsung digunakan
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body: Joi.string().min(4).required(),
  }).required(),
});
