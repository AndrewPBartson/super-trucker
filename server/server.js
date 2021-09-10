const express = require('express');
const mongoose = require('mongoose');
const app = express();
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const port = process.env.PORT || 8880;
const path = require('path');
const users = require('./routes/api/users');
const trips = require('./routes/api/trips');

app.disable('x-powered-by');
app.use(morgan('dev'));
app.use(cors());
// convert incoming data to json if needed -
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

// passport init
app.use(passport.initialize());
require('../config/passport')(passport);

// db config
const dbURI = require('../config/keys').mongoURI;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log("MongoDB NOT connected: " + error));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow_Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.use('/api/users', users);
app.use('/api/trips', trips);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  });
}
else {
  app.get(
    '/',
    (req, res) => res.send('Server running in development mode')
  );
}

// last middleware (except error MW) handles req w/ no matching route
app.use((req, res, next) => {
  res.status(404).json({ error: { message: 'Not found - status 404' } })
});

// middleware with 4 arguments is only called in case of error
app.use((err, req, res, next) => {
  console.log('err.status - ', err.status);
  res.status(500).json({ error: { message: `Whaaaat?   ${err}` } })
  // this also works:
  // res.status(500).json(err.message)
});

// if a MW calls res.anything(), res is returned and sent, 
// end of execution on server
// if a MW doesn't call next(), no more MW is run...
// but execution may continue with non-MW, such as listen():
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
