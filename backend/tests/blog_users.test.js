const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const assert = require('node:assert')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const { isNull } = require('lodash')

const api = supertest(app)

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })
})

describe('tests for proper username and password', () => {
  test('empty username provides error', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: null,
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(
      result.body.error,
      'Username is required and must be at least 3 characters long'
    )

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('empty password provides error', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "mluukkai",
      name: 'Matti Luukkainen',
      password: null,
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(
      result.body.error,
      'Password is required and must be at least 3 characters long'
    )

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('existing username provides error', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "mluukkai",
      name: 'Matti Luukkainen',
      password: 'tosisalainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(result.body.error, `Username '${newUser.username}' is already taken`)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

describe('tests for showing user who added blog and list of blogs added by user ', () => {
  test('a new blog is correctly associated with an existing user', async () => {
    
    const newUser = {
      username: 'skubrick',
      name: 'Stanley Kubrick',
      password: 'moloko',
    }

    const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const id = result.body._id

    const newBlog = { 
      title: "Dim, Georgie, and Pete",
      author: "Alex",
      url: "http://clockworkorange.com",
      likes: 42,
      user: id,
    }
  
    const blogResponse = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const savedBlog = blogResponse.body
    assert.strictEqual(savedBlog.user.username, newUser.username, "Blog's username does not match the user")
    assert.strictEqual(savedBlog.user.name, newUser.name, "Blog's user name does not match the user")
    assert.strictEqual(savedBlog.user.id, newUser.id, "Blog's user ID does not match the user")
  
    const updatedUserResponse = await api.get(`/api/users/${newUser.id}`)
    const updatedUser = updatedUserResponse.body
    assert.strictEqual(updatedUser.blogs.length, newUser.blogs.length + 1, "User's blog count does not match")
  })  
})

after(async () => {
  await mongoose.connection.close()
})