const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes');
const mongoose = require('mongoose');

app.disable('x-powered-by');
app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

const dbURI = require('../config/keys').mongoURI;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow_Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.use(routes.users);
app.use(routes.trips);

// it seems that angular handles root requests, because this
// doesn't get called:
// app.get('/', (req, res, next) => {
//   res.send(`Hello from Earth!`)
// })

// last middleware (except error MW) handles req w/ no matching route
app.use((req, res, next) => {
  res.status(404).json({ error: { message: 'Not found - status 404' }})
});

// middleware with 4 arguments is only called in case of error
app.use((err, req, res, next) => {
  console.log('err.status - ', err.status);
  res.status(500).json({error: { message: `Whaaaat?   ${err}` } })
  // this also works:
  // res.status(500).json(err.message)
});

// if a MW calls res.anything(), res is returned, end of execution on server
// if a MW doesn't call next(), no more MW is run...
// but execution may continue with non-MW, such as listen():
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
