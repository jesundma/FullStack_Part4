const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const listWithNoBlogs = []
const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

const listWithMultipleBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]

describe('Test dummy', () => {
  test('dummy returns one', () => {
    const blogs = []
    const result = listHelper.dummy(blogs)
    
    assert.strictEqual(result, 1)})
})

describe('total likes', () => {

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has multiple blogs ', () => {
    const result = listHelper.totalLikes(listWithMultipleBlogs)
    assert.strictEqual(result, 36)
  })
  test('when list no blogs ', () => {
    const result = listHelper.totalLikes(listWithNoBlogs)
    assert.strictEqual(result, 0)
  })


  describe('most likes for a blog', () => {
    const answer = {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    }
    test('Blog with the most likes', () => {
      const result = listHelper.favoriteBlog(listWithMultipleBlogs)
      assert.deepStrictEqual(result, answer)
    })
  })
  describe('most blogs', () => {
    const answer = {
      author: "Robert C. Martin",
      blogs: 3
    }
    test('Most blogs by author', () => {
      const result = listHelper.mostBlogs(listWithMultipleBlogs)
      assert.deepStrictEqual(result, answer)
    })
  })
  describe('most likes', () => {
    const answer = {
      author: "Edsger W. Dijkstra",
      likes: 17
    }
    test('Most likes by author', () => {
      const result = listHelper.mostLikes(listWithMultipleBlogs)
      assert.deepStrictEqual(result, answer)
    })
  })
})