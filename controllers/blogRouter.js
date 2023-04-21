const blogRouter = require('express').Router()
const logger = require('../utils/logger')
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

blogRouter.delete('/:id', async (req, res, next) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id)
    if (deletedBlog) {
      logger.info(`Deleted blog with id ${req.params.id}`)
      res.sendStatus(204)
    } else {
      logger.info(`Blog with id: ${req.params.id} not found`)
      res.sendStatus(404).json({ error: 'Blog not found' })
    }
  } catch (error) {
    next(error)
  }
})

blogRouter.put('/:id', async (req, res, next) => {
  try {
    const options = {
      new: true,
      runValidators: true,
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, options)

    res.status(200).json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogRouter
