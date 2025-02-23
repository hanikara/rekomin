const express = require('express');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ErrorHandler = require('./utils/ErrorHandler');
const methodOverride = require('method-override');
const { default: mongoose } = require('mongoose');
const path = require('path');
const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { resourceLimits } = require('worker_threads');

// connect to MongoDB
mongoose
  .connect('mongodb://127.0.0.1/rekomin')
  .then((result) => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'the-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 1,
      maxAge: 300000, // 5 minutes
    },
  })
);
app.use(flash());
// passport middleware
app.use(passport.initialize());
app.use(passport.session()); // harus diletakkan dibawah express session
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// routes home
app.get('/', (req, res) => {
  res.render('home');
});

app.use('/', require('./routes/auth'));
// places routes
app.use('/places', require('./routes/places'));
app.use('/places/:place_id/reviews', require('./routes/reviews'));

// Error routes global
app.all('*', (req, res, next) => {
  next(new ErrorHandler('Page not found', 404));
});

app.use((err, req, res, next) => {
  // res.status(500).send({ message: err.message });
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh no, Something went wrong';
  res.status(statusCode).render('error', { err });
});

// app.get("/seed/place", async (req, res) => {
//   const place = new Place({
//     title: "Example Place",
//     price: "Rp120000",
//     description: "This is an example place",
//     location: "Jakarta, Indonesia",
//   });

//   await place.save();
//   res.send(place);
// });
app.listen(3000, () => {
  console.log('Server is running on http://127.0.0.1:3000');
});
