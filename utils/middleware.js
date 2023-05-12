/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
const jwt = require('jsonwebtoken')
const logger = require('./logger')
const User = require('../models/user')

const unknownEndpoint = (req, res, next) => {
  res.status(404).json({ error: 'Unknown endpoint' })

  next()
}

const errorHandler = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(400).json({ error: error.message })
  }

  logger.error(error.message)
  next(error)
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {
    // eslint-disable-next-line prefer-destructuring
    req.token = authorization.split(' ')[1]
    return next()
  }

  req.token = null
  next()
}

const userExtractor = async (req, res, next) => {
  try {
    if (!req.token) {
      req.user = null
      next()
    } else {
      const decodedToken = jwt.verify(req.token, process.env.SECRET_KEY)
      const user = await User.findById(decodedToken.id)
      req.user = user
      next()
    }
  } catch (error) {
    next(error)
  }
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}
