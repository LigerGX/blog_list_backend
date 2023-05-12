const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const blogsUtil = require('./blogs_test_util')

const api = supertest(app)
let token

beforeAll(async () => {
  await Blog.deleteMany({})

  const promiseArray = blogsUtil.initialBlogs.map((blog) => {
    const blogDocument = new Blog(blog)
    return blogDocument.save()
  })

  await Promise.all(promiseArray)

  await User.deleteMany({})

  const user = {
    username: 'Testboy',
    password: 'test123',
    name: 'Test Boy',
  }

  await api.post('/api/users').send(user)

  const res = await api.post('/api/login')
    .send({
      username: 'Testboy',
      password: 'test123',
    })

  token = res.body.token
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
      .set('Authorization', `Bearer ${token}`)
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

    const response = await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blog)
    expect(response.body.likes).toBe(0)
  })

  test('if no title property, respond with status 400', async () => {
    const blog = {
      author: 'Nie Sorcerie',
      url: 'vtooberguide.com',
      likes: 5883,
    }

    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blog)
      .expect(400)
  })

  test('if no url property, respond with status 400', async () => {
    const blog = {
      title: 'Nier Guide',
      author: 'Nie Sorcerie',
      likes: 5883,
    }
    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blog)
      .expect(400)
  })

  test('if no token, respond with status 401', async () => {
    const blog = {
      title: 'Digimon World',
      author: 'Ginjou Higiri',
      url: 'ginjouguide.com',
      likes: 136,
    }

    await api.post('/api/blogs')
      .send(blog)
      .expect(401)
  })
})

describe('DELETE request', () => {
  test('can make a successful DELETE request', async () => {
    const blogs = await api.get('/api/blogs')
    const blogToDelete = blogs.body[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAfter = await api.get('/api/blogs')
    const contents = blogsAfter.body.map((blog) => blog.title)

    expect(blogsAfter.body).toHaveLength(blogs.body.length - 1)
    expect(contents).not.toContain(blogToDelete.title)
  })
})

describe('PUT request', () => {
  test('can make a succesful PUT request', async () => {
    const blogs = await api.get('/api/blogs')
    const blogToUpdate = blogs.body[0]
    const updateObject = {
      ...blogToUpdate,
      likes: 99,
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updateObject)

    expect(response.status).toBe(200)
  })

  test('malformed request will return an error', async () => {
    const blogs = await api.get('/api/blogs')
    const blogToUpdate = blogs.body[0]
    const updateObject = {
      title: null,
    }

    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .send(updateObject)
      .expect(400)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
