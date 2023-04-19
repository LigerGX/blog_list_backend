const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({})
    res.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogRouter.post('/', async (req, res, next) => {
  const blog = new Blog(req.body)

  try {
    const result = await blog.save()
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = blogRouter
