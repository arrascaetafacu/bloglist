const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({})
    .populate('blogs', { title: 1, author: 1, url: 1 })
  res.json(users)

})

usersRouter.post('/', async (req, res) => {
  const {name, username, password} = req.body
  if (!password || !username)  return res.status(400).send({ error: 'username or password missing' })
  if (password.length < 3) return res.status(400).send( {error: 'password must be at least 3 characters long'})
  
  const userInDb = await User.findOne({ username })
  if (userInDb !== null) return res.status(400).send({ error: 'username must be unique' })

  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({
    name,
    username,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

module.exports = usersRouter