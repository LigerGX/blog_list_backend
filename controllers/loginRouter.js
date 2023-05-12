/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    const passwordCheck = user
      ? await bcrypt.compare(password, user.password)
      : false

    if (passwordCheck === false || user === false) {
      return res.status(400).json({ error: 'invalid username or password' })
    }

    const payload = { username: user.username, id: user._id }
    const token = jwt.sign(payload, process.env.SECRET_KEY)

    res.status(200).json({ token, username: user.username, name: user.name })
  } catch (error) {
    next(error)
  }
})

module.exports = loginRouter
