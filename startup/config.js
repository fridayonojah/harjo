const config = require('config')

module.exports = function () {
  if (!config.get('jwtPrivateKey')) {
    throw new Error('FATA ERROR: jwtprivateKey not found.')
  }
}
