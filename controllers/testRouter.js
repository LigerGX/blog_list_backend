const testRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

testRouter.post('/reset', async (req, res, next) => {
  try {
    await Blog.deleteMany({})
    await User.deleteMany({})

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = testRouter
