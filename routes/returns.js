const Joi = require('joi')
const validate = require('../middleware/validator')
const { Rental } = require('../models/rental')
const { Movie } = require('../models/movie')
const auth = require('../middleware/auth')
const express = require('express')
const router = express.Router()

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  // check for rental in database if it contain customer and movie id
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId)
  if (!rental) return res.status(404).send('Rental not found')

  // check if rental date is set or processed
  if (rental.dateReturned)
    return res.status(400).send('Return already processed')

  rental.return()
  await rental.save()

  await Movie.update(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    },
  )

  return res.send(rental)
})

function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  })

  return schema.validate(req)
}

module.exports = router
