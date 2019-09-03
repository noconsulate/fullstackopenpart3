const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())


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

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]
app.get('/', (req, res) => {
  res.send('<h1>text here and ppodfdies</h2>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  const date = new Date()
  res.send(
    `<p>There are ${persons.length} entries in the phonebook. <br>
    ${date.toString()} </p>`
  )
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id = id)
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end();
})

const generateId = () => {
  const maxId = persons.length > 0
  ? Math.max(...persons.map(n => n.id))
  : 0
}

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
  const exists = persons.filter(person => 
    person.name.toLocaleLowerCase() === body.name.toLocaleLowerCase())
  if (exists.length > 0) {
    return response.status(400).json({
      error: 'name already in phonebook'
    })
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

const port = process.env.PORT || 3001;
app.listen(port)
console.log(`Server running on port ${port}`)