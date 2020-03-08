const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
// const mongoose = require('mongoose');
// need to run mongodb in a terminal window
// deprecated error -
// mongoose.connect('mongodb://localhost/usersSchema');

app.disable('x-powered-by');
app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow_Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

let routes = require('./routes');
app.use(routes.users);
app.use(routes.trips);
// create and save a trip
// edit a trip
// get saved trip 

app.use((req, res, next) => {
  res.status(404).json({ error: { message: 'Not found - status 404' }})
})

app.use((err, req, res, next) => {
  console.log('err.status - ', err.status);
  res.status(500).json({error: { message: `Whaaaat?   ${err}` } })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})

