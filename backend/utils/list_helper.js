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


module.exports = {
  dummy, totalLikes
}