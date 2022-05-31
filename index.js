
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
require('dotenv').config()
const Person = require('./models/person')


app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})

app.use(
    morgan(':url :method :body')
)

/*get all persons*/
app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
        .catch(error => next(error))
})

/*info*/
app.get('/info', (req, res, next) => {
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
    Person.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

/*add new person to the list*/
app.post('/api/persons',(req, res, next) => {
    const { name, number } = req.body

    const person = new Person({
        name: name,
        number: number,
    })

    person
        .save()
        .then((savedPerson) => {
            res.json(savedPerson)
        })
        .catch(error => next(error))
})


//update person by id
app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(
        req.params.id,
        { name,number },
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
    if(error.name === 'CastError') {
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
