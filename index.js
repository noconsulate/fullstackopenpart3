require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

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
/*
app.get('/info', (req, res) => {
  const date = new Date()
  res.send(
    `<p>There are ${persons.length} entries in the phonebook. <br>
    ${date.toString()} </p>`
  )
})
*/
app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    res.json(person.toJSON())
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end();
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  logger(request, response, function(res, req) {
    null
  })
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
  /*
  const exists = persons.filter(person => 
    person.name.toLocaleLowerCase() === body.name.toLocaleLowerCase())
  if (exists.length > 0) {
    return response.status(400).json({
      error: 'name already in phonebook'
    })
  }
  */
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
})

const port = process.env.PORT;
app.listen(port)
console.log(`Server running on port ${port}`)