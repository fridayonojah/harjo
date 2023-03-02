// This modules for mainly for preparing our application for production

const helmet = require('helmet');
const compression = require('compression');

module.exports = function(app){
    app.use(helmet());
    app.use(compression());
}