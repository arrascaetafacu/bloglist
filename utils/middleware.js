const User = require('../models/user')

const requestLogger = (req, res, next) => {
  if (process.env.ENV_NODE !== 'test') {
    console.log('method:', req.method)
    console.log('path:', req.path)
    console.log('body:', req.body)
    console.log('---')
  }

  next()
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7)
  }

  next()
}

const errorHandler = (error, req, res, next) => {
  console.error(error)
  if (error.name === 'CastError') {
    res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    res.status(400).send({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    res.status(401).send({ error: error.message })
  }
  next(error)
}

const unknownEndpoint = (req, res, next) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
  requestLogger,
  errorHandler,
  unknownEndpoint,
  tokenExtractor
}