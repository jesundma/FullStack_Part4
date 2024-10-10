const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.lenght === 0) {
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

module.exports = {
  dummy, totalLikes, favoriteBlog
}