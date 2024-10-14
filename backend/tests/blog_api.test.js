const { test, after } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('notes are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
  })

test('there are two notes', async () => {
  const response = await api.get('/api/blogs')  
    assert.strictEqual(response.body.length, 2)
  })
  
  after(async () => {
    await mongoose.connection.close()
  })