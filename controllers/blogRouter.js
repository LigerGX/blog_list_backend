/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')
const Blog = require('../models/blog')

blogRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user')
    res.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogRouter.get('/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('user')

    if (!blog) {
      return res.status(404).json({ error: 'blog not found' })
    }
    res.json(blog)
  } catch (error) {
    next(error)
  }
})

blogRouter.post('/', async (req, res, next) => {
  try {
    const { token, user } = req

    if (!token) {
      return res.status(401).json({ error: 'missing token' })
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }

    const blog = new Blog({ ...req.body, user: user.id })

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()

    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', async (req, res, next) => {
  try {
    const { token, user } = req

    if (!token) {
      return res.status(401).json({ error: 'missing token' })
    }

    const blogToDelete = await Blog.findById(req.params.id)
    if (blogToDelete.user.toString() !== user.id) {
      return res.status(401).json({ error: 'Access Forbidden' })
    }

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
