const unknownEndpoint = (req, res, next) => {
  res.status(404).json({ error: 'Unknown endpoint' })

  next()
}

const errorHandler = (error, req, res, next) => {
  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler,
}
