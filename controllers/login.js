const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')


// login button was pressed
loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  // searches User database to find a matching username
  const user = await User.findOne({ username })

  // if the user === null
    // return false --> password is empty
    // else return with function --> check password with bcrypt
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  // if the user isn't found or the password is incorrect
  // return with a not found status
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  // creating a token for the user
  // this is the payload that gets encrypted by jwt
  // and decrypted when using jwt.verify(token,secret)
  // in places that require the sever to authenticate the browser
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // signing the token with the server credentials
  // token expires in 60*60seconds - 1hr
  const token = jwt.sign(
    userForToken, 
    process.env.SECRET,
    { expiresIn: 60*60 }
  )
  // responding with credential information
  // that the browser can use for it's session
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter