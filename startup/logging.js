const winston = require('winston')

require('express-async-errors')

module.exports = function () {
  winston.add(
    new winston.transports.File({
      filename: 'uncaughtExceptions.log',
      handleExceptions: true,
    }),
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
  )

  //handling an unhandled exceptions
  process.on('unhandledRejection', (ex) => {
    throw ex
  })

  winston.add(new winston.transports.File({ filename: 'logfile.log' }))
  // winston.add(
  //     new winston.transports.MongoDB({
  //     db: config.get("db"),
  //     level: "info",
  //     options:{
  //     useUnifiedTopology: true}
  // }));
}
