const logger = require('./logger')

const unknownEndpoint = (req, res, next) => {
  res.status(404).json({ error: 'Unknown endpoint' })

  next()
}

const errorHandler = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    res.status(400).json({ error: error.message })
  }
  logger.error(error.message)
  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler,
}
