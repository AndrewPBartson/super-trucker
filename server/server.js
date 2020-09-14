const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const morgan = require('morgan')
const cors = require('cors')
let routes = require('./routes');
// const mongoose = require('mongoose');
// need to run mongodb in a terminal window
// deprecated error -
// mongoose.connect('mongodb://localhost/usersSchema');

app.disable('x-powered-by');
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow_Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.use(routes.users);
app.use(routes.trips);

// app.get('/', (req, res, next) => {
//   // request for root of API server, doesn't look at routes/ or controllers/
//   const message = 'Namah Sivaya!'
//   console.log(`Hit on '/' route: ${message}`)
//   res.send(`Hello from Earth: ${message}`)
// })

// last middleware (except error MW) is for req w/ no matching route
app.use((req, res, next) => {
  res.status(404).json({ error: { message: 'Not found - status 404' }})

})
// middleware with 4 arguments is only called in case of error
app.use((err, req, res, next) => {
  console.log('err.status - ', err.status);
  res.status(500).json({error: { message: `Whaaaat?   ${err}` } })
  // this also works:
  // res.status(500).json(err.message)
})

// if a MW calls res.anything(), res is returned, end of execution on server
// if a MW doesn't call next(), no more MW is run, 
// but execution may continue with non-MW, such as listen():
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})
