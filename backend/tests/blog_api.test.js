const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const { isNull } = require('lodash')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('notes are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
  })

test('there are two notes', async () => {
  const response = await api.get('/api/blogs')  
    assert.strictEqual(response.body.length, 6)
  })

test('blog identifiers are in id field, not _id', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsDB = response.body

  blogsDB.forEach(blog => {
    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
    })
  })

test('add new blog functions and confirm that original and response values are same', async () => {
  const newBlog = {
    "title": "Meaning of life",
    "author": "Douglas, A.",
    "url": "http://douglasadams.com",
    "likes": 42
  }
    
  const postedBlog = await api
    .post('/api/blogs/')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const { id, ...postedBlogDropId } = postedBlog.body

  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert.deepStrictEqual(postedBlogDropId, {
    title: newBlog.title,
    author: newBlog.author,
    url: newBlog.url,
    likes: newBlog.likes
  })
})

test('field likes has default value of 0 if no value provided', async () => {
  const newBlog = {
    "title": "Spice Must Flow",
    "author": "Spacing Guild",
    "url": "http://melange.com",
    "likes": null
  }

  const postedBlog = await api
    .post('/api/blogs/')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(postedBlog.body.likes, 0)

})

test('request without fields title and url response is 400 Bad Request', async () => {
  const newBlog = {
    "title": null,
    "author": "Spacing Guild",
    "url": null,
    "likes": 0
  }

  const postedBlog = await api
    .post('/api/blogs/')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(postedBlog.body.error, 'Title and URL required')
})

  after(async () => {
    await mongoose.connection.close()
  })