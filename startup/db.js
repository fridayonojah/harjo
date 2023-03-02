const winston = require('winston')
const mongoose = require('mongoose')
const config = require('config')

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

module.exports = function () {
  const db = config.get('db')
  mongoose
    .connect(db, connectionParams)
    .then(() => winston.info(`Connected to ${db} ...`))
    .catch((err) => {
      winston.info(`Error connecting to the database. n${err}`)
    })
}
