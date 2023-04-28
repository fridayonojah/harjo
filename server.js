const winston = require('winston')
const express = require('express')
const config = require('config')
const app = express()

require('./startup/logging')()
require('./startup/cors')(app)
require('./startup/routes')(app)
require('./startup/db')()
require('./startup/config')()
require('./startup/validate')()
require('./startup/prod')(app)


if(config.get('NODE_ENV') === 'production' || config.get('NODE_ENV') === 'development'){
    const server = app.listen(config.get('port'), () =>
    console.log(`Listening on port ${port}...`),
  )
}

module.exports = server
