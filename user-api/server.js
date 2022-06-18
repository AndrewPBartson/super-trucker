const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const users = require('./routes/api/users');
// mongoose needs User schema - don't remove
const User = require('./models/User');
const app = express();
const PORT = 7770;
const { dbUser, dbPwd, dbUrl } = process.env;

app.use(express.json());

app.disable('x-powered-by');
app.use(morgan('tiny'));
app.use(cors());
// convert incoming data to json if needed -
app.use(express.urlencoded({ extended: false }))
// passport init
app.use(passport.initialize());
require('./passport/passport')(passport);

// db config
const dbURI = `mongodb+srv://${dbUser}:${dbPwd}@${dbUrl}?retryWrites=true&w=majority`;

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log("MongoDB NOT connected: " + error));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow_Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use('/', users);

// @route   /
// @desc    Test route
// @access  Public
app.get(
  '/',
  (req, res) => res.send('user-api microservice running in the cloud')
);

// last middleware (except error MW) handles req w/ no matching route
app.use((req, res, next) => {
  res.status(404).json({ error: { message: 'Not found - status 404' } })
});

// middleware w/ 4 arguments is only called in case of error
app.use((err, req, res, next) => {
  console.log('err.status - ', err.status);
  res.status(500).json({ error: { message: `Error in user-api   ${err}` } })
});

// if a MW calls res.anything(), res is returned and sent, 
// end of execution on server
// if a MW doesn't call next(), no more MW is run...
// but execution may continue with non-MW, such as listen():
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});