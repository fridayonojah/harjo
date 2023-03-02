// define a model for our api
const Joi = require('joi');
const mongoose = require('mongoose');

// schema for our document
const genreSchema = new mongoose.Schema({
  name: {
    _id: String,
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  }
});

const Genre = mongoose.model('Genre', genreSchema);

function validateGenre(customer) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(5).max(50).required(),
    isGold: Joi.boolean(), 
  });
  const result = schema.validate(customer);
  return result;
}

exports.genreSchema = genreSchema;
exports.Genre = Genre; 
exports.valadation = validateGenre;