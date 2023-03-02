// todo
//load modules
const config = require('config')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const mongoose = require('mongoose')

// define a schema

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    maxlength: 50,
  },
  email: {
    type: String,
    require: true,
    minlength: 5,
    maxlength: 50,
  },
  password: {
    type: String,
    require: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: Boolean,
})

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    config.get('jwtPrivateKey'),
  )
  return token
}

const User = mongoose.model('User', userSchema)

// create a joi validation function
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  })
  return schema.validate(user)
}

// export our schema definition and function validator
exports.User = User
exports.validateUser = validateUser
