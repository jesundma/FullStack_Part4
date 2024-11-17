const { test, after, beforeEach, describe } = require('node:test')
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
  const response = await api //Router mounted with full path /api/blogs/
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

describe('tests for field content and default', () => { 
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
})

test('Deleting blog functions', async () => {
  const newBlog = {
    "title": "Four legs good, two legs bad",
    "author": "Spacing Napoleon",
    "url": "www.orwellwasright.com",
    "likes": 42
  }

  const postedBlog = await api
    .post('/api/blogs/')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    // Blog posted, id in response

  const blogId = postedBlog.body.id
  
  const deletedBlog = await api
    .delete(`/api/blogs/${blogId}`)
    .expect(204)

    // Blog deletion response 204 No Content

  assert.strictEqual(deletedBlog.status, 204, 'Status code 204 for delete')

  const deletedBlogResponse =  await api
  .get(`/api/blogs/${blogId}`)
  .expect(404)
  
  // Blog get by id should return 404

  assert.strictEqual(deletedBlogResponse.status, 404, 'Status code 404 after deletion')

})

  after(async () => {
    await mongoose.connection.close()
  })