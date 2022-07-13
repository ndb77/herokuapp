const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  // The type of the field is ObjectId that references note-style documents. 
  // basically this is saying that there will be a field called "notes"
  // that will be formatted according to 'Note' schema

  // notes is an array of mongoDB objectIds
  // each user will have an array of notes objectIds that were 
  // created by the user
  notes:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],

})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})


module.exports = mongoose.model('User', userSchema)