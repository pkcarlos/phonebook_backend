require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

const customFormat = (tokens, request, response) => {
  morgan.token('data', (request, response) => {
    return JSON.stringify(request.body)
  })

  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    tokens.data(request, response)
  ].join(' ')
}

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(customFormat)) // configure morgan to show data sent in HTTP POST requests
app.use(cors())

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  },
]

// retrieve all entries
app.get('/api/persons', (request, response) => {
  Contact.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Contact.find({}).then(persons => {
    const numPersons = persons.length
    const time = Date()
    const html = `<p>Phonebook has info for ${numPersons} people</p><p>${time}</p>`
    
    response.send(html)
  })
})

// retrieve single phonebook entry
app.get('/api/persons/:id', (request, response) => {
  Contact.findById(request.params.id)
    .then(contact => {
      response.json(contact)
    })
    .catch(error => next(error))
})

// delete single entry
app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// create new entry
app.post('/api/persons', (request, response, next) => {
  const newEntry = request.body

  if (!newEntry.name) {
    return response.status(400).json({
      error: 'must include name'
    })
  } else if (!newEntry.number) {
    return response.status(400).json({
      error: 'must include number'
    })
  } else if (persons.map(person => person.name).includes(newEntry.name)) {
    return response.status(400).json({
      error: 'name already exists in the phonebook'
    })
  }

  const contact = new Contact({
    name: newEntry.name,
    number: newEntry.number,
  })

  contact.save()
    .then(savedContact => {
      response.json(savedContact)
    })
    .catch(error => next(error))
})

// update phone number of existing contact ---allows edit with invalid phone number (validation not working)
app.put('/api/persons/:id', (request, response, next) => {
  const newEntry = request.body
  const contact = new Contact({
    name: newEntry.name,
    number: newEntry.number,
  }, { _id: false })

  console.log(contact)

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then(updatedContact => {
      response.json(updatedContact)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})