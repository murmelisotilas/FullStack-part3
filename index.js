require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express() 
const Person = require('./models/person')

let persons = [
    { 
      id: 1,
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: 2,
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: 3,
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: 4,
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]


app.use(express.json())
app.use(express.static('build'))
app.use(cors())

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

morgan.token('body', (req, res) => { 
    return JSON.stringify(req.body)
})

const generateId = () => {
    return Math.floor(Math.random() * 10000)
}

/*add new person to the list*/
app.post('/api/persons', morgan(':url :method :body'),(req, res) => {
    const body = req.body

    if(!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    if(persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'name is already in use'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})


app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

/*get all persons*/
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

/*get person by id*/
app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
    .catch(error => {
        res.status(404).end()
    })
})

/*info*/
app.get('/info', (req, res) => {
    console.log(`Phonebook has info for ${persons.length} people`)
    const time = new Date()
    res.send(`Phonebook has info for ${persons.length} people <br/> ${time}`)
})

/*readme*/
app.get('/api/persons', (req, res) => {
    res.sendFile('README.md', {root: __dirname})
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})
