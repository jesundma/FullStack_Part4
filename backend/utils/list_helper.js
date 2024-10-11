const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
   return 0
  }

  let result = 0
  blogs.forEach(blog => {
    result += blog.likes
  })
  return result
}

const favoriteBlog = (blogs) => {
  let mostLikes = 0
  let result = {}

  blogs.forEach(blog => {
    if(blog.likes > mostLikes) {
      mostLikes = blog.likes
      result = blog
    }
    console.log(blog)
  })
  return result
}

const mostBlogs = (blogs) => {
  const groupedByAuthor = lodash.groupBy(blogs, 'author')
  let authorWithMostBlogs = { author: '', blogs: 0 }

  lodash.forEach(groupedByAuthor, (authorBlogs, author) => {
    if (authorBlogs.length > authorWithMostBlogs.blogs) {
      authorWithMostBlogs = { author, blogs: authorBlogs.length }
    }
  })
  return authorWithMostBlogs
}

const mostLikes = (blogs) => {
  const groupedByAuthor = lodash.groupBy(blogs, 'author')
  const likesByAuthor = lodash.map(groupedByAuthor, (authorBlogs, author) => {
    const totalLikes = lodash.sumBy(authorBlogs, 'likes')
    return {
      author: author,
      likes: totalLikes
    }
  })

  const mostLikedAuthor = lodash.maxBy(likesByAuthor, 'likes')

  return mostLikedAuthor
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}