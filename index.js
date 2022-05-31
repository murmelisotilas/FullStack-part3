require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express() 
const Person = require('./models/person')
const { response } = require('express')


app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('body', (req, res) => { 
    return JSON.stringify(req.body)
})

/*get all persons*/
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
    .catch(error => next(error))
})

/*info*/
app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        res.send(
            `<p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>`
        )
    })
    .catch((error) => next(error))
})

/*get person by id*/
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if(person){
        res.json(person)
        } else {
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

//delete person by id
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
    res.status(204).end()
    })
    .catch(error => next(error))
})

/*add new person to the list*/
app.post('/api/persons', morgan(':url :method :body'),(req, res) => {
    const body = req.body
    if(!body.name || !body.number){
        return res.status(400).json({ error: 'name or number missing' })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then((savedPerson) => {
            res.json(savedPerson)
        })
        .catch(error => next(error))
})


//update person by id
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    Person.findByIdAndUpdate(
        req.params.id,
        {
            name: body.name,
            number: body.number,
        },
        { new: true, runValidators:true, context: 'query' }
    )
    .then(updatedPerson => {
        res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {  
    console.error(error.message)
    if(error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if(error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }
    next(error)
}


app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})
