const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


// getting all of the users
usersRouter.get('/', async (request, response) => {
  // finding users without filter
  // populating the notes field 
  // use {} selector to define what exactly is getting populated from notes
  const users = await User.find({}).populate('notes',{date:1,content:1})
  response.json(users)
})

// getting all of the users
usersRouter.get('/:id', async (request, response) => {
  // finding users without filter
  // populating the notes field 
  // use {} selector to define what exactly is getting populated from notes
  const user = await User.findById(request.params.id).populate('notes',{date:1,content:1})
  response.json(user)
})

// creating a new user
usersRouter.post('/', async (request, response) => {
  // destructuring request
  const { username, name, password } = request.body

  // check to see if an existing user already exists
  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // creating a new user with the request body info
  const user = new User({
    username,
    name,
    passwordHash,
  })

  // adding the user to the database
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter