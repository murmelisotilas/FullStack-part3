const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
.then(result => {
    console.log('connected to MongoDB')
})
.catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
})

const extraValidators = [
    {
        validator: (val) => {
            if((val[2] === '-' || val[3] === '-') && val.length < 9) {
                return false
            }
            return true
        },
        message: '{VALUE} is not a valid phone number!'
    },
    {
        //allow only numbers and dashes
        validator: (val) => {
            return /^[0-9-]+$/.test(val)
        },
        message: '{VALUE} is not a valid phone number!'
    },
]

const personSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    number: {type: String, required: true, validate: extraValidators,},
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
