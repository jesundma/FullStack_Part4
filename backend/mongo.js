const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[3]
console.log(password)

const url = `mongodb+srv://JSundman:${password}@cluster0.2ymmr5x.mongodb.net/testBlogList?retryWrites=true&w=majority&appName=Cluster0`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  })

const Blog = mongoose.model('Blog', blogSchema)

if (process.argv.length === 4) {
  console.log(Blog.collection.name + ':')
  Blog.find({}).then(result => {
    result.forEach(blog => {
      console.log(`${blog.title} ${blog.author} ${blog.url} ${blog.likes}`)
    })
    mongoose.connection.close()
  })
} else {
  const blog = new Blog({
    title: process.argv[4],
    author: process.argv[5],
    url: process.argv[6],
    likes: process.argv[7]
  })

  blog.save().then(() => {
    console.log(`Added ${blog.title} author ${blog.author} likes ${blog.likes} to testing database`)
    mongoose.connection.close()
  })
}
