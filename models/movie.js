//moddules
const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema } = require('./genres');
const Genre = require('./genres');

//mongoose object model
const Movie = new mongoose.model('movies', new mongoose.Schema({
   title: {
       type: String,
       required: true,
       minlength:5,
       maxlength: 225
   },
   
   genre:{
       type: genreSchema,
       require: true
   },

   numberInStock: { 
    type: Number, 
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: { 
    type: Number, 
    required: true,
    min: 0,
    max: 255
  }

}));

//validation
function validateMovie(movie){
  const schema = Joi.object({
    title: Joi.string().max(50).min(5).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
  });

  return schema.validate(movie);
}

// exports
exports.Movie = Movie;
exports.validateMovie = validateMovie;