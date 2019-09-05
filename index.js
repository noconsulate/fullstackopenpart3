require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))

const logger = morgan(':method :url :status :res[content-length] - :response-time ms :reqObj')

morgan.token('reqObj', function(req, res) {
  return JSON.stringify(req.body)
})
morgan.token('host', function(req, res) {
	return req.hostname;
});
morgan.token('folder', function(req, res) {
  return '/api/persons'
}) 

app.get('/', (req, res) => {
  res.send('<h1>text here and ppodfdies</h2>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  }).catch(error => console.log(error.message))
})

app.get('/info', (req, res) => {
  const date = new Date()
  Person.find({}).then(persons => {
    res.send(
      `<P> there are ${persons.length} entries in the database<br>
      ${date.toString()}</p>`
    )
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
  .then(person => {
    if (person) {
      res.json(person.toJSON())
    } else {
      res.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(404).end()
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const note = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, note, {new: true})
  .then(updatePerson => {
    response.json(updatePerson.toJSON())
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send( {error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send( {error: 'malformatted id' })
  } else if (error.errors.name.kind === 'unique-validator') {
    return response.status(400).send( {error: 'entry already exists' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json( {error: 'name or number too short' })
  }
  next(error)
}
app.use(errorHandler)

const port = process.env.PORT;
app.listen(port)
console.log(`Server running on port ${port}`)