const notesRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Note = require('../models/note')
const User = require('../models/user')


const getTokenFrom = request => {
  // getting the header from the request
  const authorization = request.get('authorization')

  // if the authorization matches the word "bearer" 
  // return the authorization from index 7 onwards
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

// getting all notes
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user',{username:1,name:1})
  response.json(notes)
  // Note.find({}).then(notes => {
  //   response.json(notes)
  // })
})

// get a specific note
notesRouter.get('/:id', async (request, response, next) => {
  const note = await Note.findById(request.params.id)
  if(note){
    response.json(note)
  }else{
    response.status(404).end()
  }
})

// save a new note
notesRouter.post('/', async (request, response, next) => {
  // gets body of request
  //  "content": "",
  // "important": bool,
  // "userId": ""
  const body = request.body

  // getting the token from the request header
  const token = getTokenFrom(request)
  // decoding the token and making the 
  // payload extractable (see controllers/login.js to see payload )
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  // searches database to find a matching user id
  // each note is associated with a user
  const user = await User.findById(decodedToken.id)

  // note is created using request params
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id // _id is a mongoDB generated value and is dropped when returning the JSON list(see models)
  })
  // note is saved to the database
  const savedNote = await note.save()

  // assigning the user.notes list to an updated list containing the 
  // recently added savedNote

  // the savedNote._ids will be referenced in the users router
  // through the populate function
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response, next) => {
  const deletedNote = await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

notesRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter