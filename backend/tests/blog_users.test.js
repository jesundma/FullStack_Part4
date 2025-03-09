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

const api = supertest(app);

let permaToken = '';
let permaUserId = '';

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  const savedUser = await user.save()
  permaUserId = savedUser._id.toString()

  const response = await api.post('/api/login').send({
    username: 'root',
    password: 'sekret',
  })

  permaToken = response.body.token
  const users = await helper.usersInDb()

  console.log(users)
})

describe('when there is initially one user at db', () => {
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

    assert.strictEqual(result.body.error,'Username is required and must be at least 3 characters long')

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    console.log(usersAtEnd)

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
    console.log(usersAtEnd)
  })

  test('existing username provides error', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "mluukkai",
      name: 'Matti Luukkainen',
      password: 'tosisalainen',
    }

    await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const sameUser = {
      username: "mluukkai",
      name: 'Matti Luukkainen',
      password: 'salainensalainen',
    }
    const result = await api
      .post('/api/users')
      .send(sameUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(result.body.error, `Username '${sameUser.username}' is already taken`)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length+1)
    console.log(usersAtEnd)
  })
})

describe('tests for showing user who added blog and list of blogs added by user ', () => {
  test('a new blog is correctly associated with an existing user', async () => {
//vaihda root user    
    const newUser = {
      username: 'skubrick',
      name: 'Stanley Kubrick',
      password: 'moloko',
    }

    const userResult = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const userId = userResult.body.id

    const loginResponse = await api
      .post('/api/login')
      .send({
      username: newUser.username,
      password: newUser.password,
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const newBlog = { 
      title: "Dim, Georgie, and Pete",
      author: "Alex",
      url: "http://clockworkorange.com",
      likes: 42,
      user: userId,
    }

    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const userCheck = blogResponse.body.user

    const updatedUserResponse = await api
      .get(`/api/users/${userCheck}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const updatedUser = updatedUserResponse.body
    
    assert.strictEqual(updatedUser.blogs.length, 1, "User's blog count does not match")
    assert.strictEqual(updatedUser.blogs[0].id, blogResponse.body.id, "User's blog ID does not match")
  })  
})

after(async () => {
  await mongoose.connection.close()
})