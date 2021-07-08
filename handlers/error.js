const Promise = require('bluebird')

const ErrorWithCode = function (message = 'Default Message', code = 200) {
  this.message = message
  this.code = code
  Error.captureStackTrace(this, ErrorWithCode)
}
ErrorWithCode.prototype = Object.create(Error.prototype)
ErrorWithCode.prototype.constructor = ErrorWithCode

exports.ErrorWithCode = ErrorWithCode

exports.catch_error = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log(err)
    res.json({
      err: true,
      msg: err.message
    })
    return true
  })
}

exports.only_catch_error = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log(err)
  })
}
