const { Rental, validate } = require('../models/rental')
const { Movie } = require('../models/movie')
const { Customer } = require('../models/customer')
const auth = require('../middleware/auth')
const config = require('config')
const router = require('express').Router()

const Fawn = require('fawn')
Fawn.init(config.get('db'))

router.get('/', auth, async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut')
  res.send(rentals)
})

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const customer = await Customer.findById(req.body.customerId)
  if (!customer) return res.status(400).send('Invalid customer.')

  const movie = await Movie.findById(req.body.movieId)
  if (!movie) return res.status(400).send('Invalid movie.')

  if (movie.numberInStock === 0)
    return res.status(400).send('Movie not in stock.')

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  })

  try {
    await new Fawn.Task()

      .save('rentals', rental)
      .update(
        'movie',
        { _id: movie },
        {
          $inc: { numberInStock: -1 },
        },
      )
      .run({ useMongoose: true })
    res.send(rental)
  } catch (ex) {
    res.status(500).send('something went wrong.')
  }
})

router.get('/:id', auth, async (req, res) => {
  const rental = await Rental.findById(req.params.id)

  if (!rental)
    return res.status(404).send('The rental with the given ID was not found.')

  res.send(rental)
})

module.exports = router
