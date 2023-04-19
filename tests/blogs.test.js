const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const blogsUtil = require('./blogs_test_util')

const api = supertest(app)

beforeAll(async () => {
  await Blog.deleteMany({})

  const promiseArray = blogsUtil.initialBlogs.map((blog) => {
    const blogDocument = new Blog(blog)
    return blogDocument.save()
  })

  await Promise.all(promiseArray)
})

describe('GET request', () => {
  test('can make successful GET request', async () => {
    await api.get('/api/blogs')
      .expect('Content-Type', /application\/json/)
      .expect(200)
  })

  test('id of a blog post is named id not _id', async () => {
    const blogs = await api.get('/api/blogs')

    expect(blogs.body[0].id).toBeDefined()
    // eslint-disable-next-line no-underscore-dangle
    expect(blogs.body[0]._id).toBeUndefined()
  })
})

describe('POST request', () => {
  test('can make a successful POST request', async () => {
    const blog = {
      title: 'Nier Guide',
      author: 'Nie Sorcerie',
      url: 'vtooberguide.com',
      likes: '5883',
    }

    await api.post('/api/blogs')
      .send(blog)
      .expect('Content-Type', /application\/json/)
      .expect(201)

    const response = await api.get('/api/blogs')

    const titles = response.body.map((item) => item.title)

    expect(response.body).toHaveLength(blogsUtil.initialBlogs.length + 1)
    expect(titles).toContain('Nier Guide')
  })

  test('if there is no likes property, likes will default to 0', async () => {
    const blog = {
      title: 'Nier Guide',
      author: 'Nie Sorcerie',
      url: 'vtooberguide.com',
    }

    const response = await api.post('/api/blogs').send(blog)
    expect(response.body.likes).toBe(0)
  })

  test('if no title property, respond with status 400', async () => {
    const blog = {
      author: 'Nie Sorcerie',
      url: 'vtooberguide.com',
      likes: 5883,
    }

    await api.post('/api/blogs')
      .send(blog)
      .expect(400)
  })

  test('if no title property, respond with status 400', async () => {
    const blog = {
      title: 'Nier Guide',
      author: 'Nie Sorcerie',
      likes: 5883,
    }
    await api.post('/api/blogs')
      .send(blog)
      .expect(400)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
