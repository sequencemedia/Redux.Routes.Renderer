require('babel-register')({ ignore: /node_modules\/(?!(redux-routes-renderer)).*/ })
module.exports = require('./lib')
