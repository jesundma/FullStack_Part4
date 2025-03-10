const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
    const users = await User
      .find({}).populate('blogs', { title: 1, author: 1, url: 1 })
    response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
  const { id } = request.params

  try {
    const user = await User.findById(id)
      .populate('blogs', { title: 1, author: 1, url: 1 })

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    response.json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return response.status(400).json({ error: 'Invalid user ID format' })
    }
  }
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username || username.length < 3) {
    return response.status(400).json({
      error: 'Username is required and must be at least 3 characters long'
    })
  }

  if (!password || password.length < 3) {
    return response.status(400).json({
      error: 'Password is required and must be at least 3 characters long'
    })
  }
  try {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
    } catch (error) {
      if (error.code === 11000) {
        return response.status(400).json({
          error: `Username '${error.keyValue.username}' is already taken`
        })
      }
    }
  })

module.exports = usersRouter