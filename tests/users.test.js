const supertest = require('supertest')
const mongoose = require('mongoose')
const User = require('../models/user')
const App = require('../app')
const helper = require('./users_test_util')

const api = supertest(App)

beforeEach(async () => {
  await User.deleteMany()

  await User.insertMany(helper.initialUsers)
})

describe('GET request', () => {
  test('Can successfully get list of users', async () => {
    const res = await api.get('/api/users')
    expect(res.status).toBe(200)
    expect(res.type).toBe('application/json')
  })
})

describe('POST request', () => {
  test('Can successfully create a new user', async () => {
    const newUser = {
      username: 'TestBoy',
      password: 'test123',
      name: 'Test Man',
    }

    const res = await api.post('/api/users').send(newUser)
    expect(res.status).toBe(201)
    expect(res.type).toBe('application/json')

    const users = await api.get('/api/users')
    const usernames = users.body.map((user) => user.username)

    expect(users.body).toHaveLength(helper.initialUsers.length + 1)
    expect(usernames).toContain('TestBoy')
  })

  test('non-unique username will return error', async () => {
    const newUser = {
      username: 'Kama',
      password: 'test123',
      name: 'Sakura Matou',
    }

    const res = await api.post('/api/users').send(newUser)
    expect(res.status).toBe(400)
    expect(res.type).toBe('application/json')
    expect(res.body).toHaveProperty('error')

    const users = await api.get('/api/users')

    expect(users.body).toHaveLength(helper.initialUsers.length)
  })

  test('password less than 3 characters long will return error', async () => {
    const newUser = {
      username: 'TestBoy',
      password: 'te',
      name: 'Test Man',
    }

    const res = await api.post('/api/users').send(newUser)
    expect(res.status).toBe(400)
    expect(res.type).toBe('application/json')
    expect(res.body).toHaveProperty('error')

    const users = await api.get('/api/users')

    expect(users.body).toHaveLength(helper.initialUsers.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
