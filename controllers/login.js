const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')


loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'password or username missing' })

  const user = await User.findOne({ username })
  let correctPassword
  if (user === null) correctPassword = false
  else correctPassword = await bcrypt.compare(password, user.passwordHash)

  if (correctPassword) {
    const userForToken = {
      username: user.username,
      id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    return res.send({ token, username: user.username, name: user.name })
  }

  res.status(401).json('invalid username or password')
})

module.exports = loginRouter