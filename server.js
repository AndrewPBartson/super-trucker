const express = require('express')
const app = express()
const port = process.env.PORT || 8001
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.disable('x-powered-by');
app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.json())

let routes = require('./routes');
app.use(routes.users);
app.use(routes.trips);
// create and save a trip
// edit a trip
// get saved trip 

app.use((req, res, next) => {
  res.status(404).json({ error: { message: 'Not found' }})
})

app.use((err, req, res, next) => {
  console.log('err.status - ', err.status);
  res.status(500).json({error: err })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})

