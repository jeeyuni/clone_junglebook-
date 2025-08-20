require('dotenv').config()
const express = require('express')
const passport = require('passport');
const Strategy = require('passport-github').Strategy;
const cors = require('cors')
const db = require('./config/db.js')
const app = express()
const port = 4000

// Configure the GitHub strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the GitHub API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
  new Strategy(
    {
      clientID: process.env["GITHUB_CLIENT_ID"],
      clientSecret: process.env["GITHUB_CLIENT_SECRET"],
      callbackURL: process.env["BASE_URL"] ? `${process.env["BASE_URL"]}/return` : "/return",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log("accessToken", accessToken);
      return cb(null, profile);
    }
  )
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete GitHub profile is serialized
// and deserialized.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require('body-parser').json())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(
  require("express-session")({
    secret: process.env["SESSION_SECRET"] || "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: 'lax',
      secure: false
    }
  })
);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

//http://localhost:4000/
app.get('/', (req, res) => { 
  res.render("home", { user: req.user }); //클라이언트 에게 응답
})

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/login/github", passport.authenticate("github"));

app.get(
  "/return",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (_req, res) {
    res.redirect(process.env.CLIENT_ORIGIN || "http://localhost:3000");
  }
);

app.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn(),
  function (req, res) {
    res.render("profile", { user: req.user });
  }
);

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.CLIENT_ORIGIN || "http://localhost:3000");
  });
});

// API: logout without redirect
app.post('/api/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err) }
    res.json({ ok: true })
  })
})

//http://localhost:4000/users
app.get('/users', (req, res) => { 
    //연결된 DBMS에 쿼리문을 날리고 응답을 콜백함수 매개변수 2번째값이 받는다.
    db.query('select * from people', (err,data) => {
        res.send(data) //클라이언트 에게 응답
    })
})

// API: Get current authenticated user
app.get('/api/me', (req, res) => {
  res.json({ user: req.user || null })
})

// API: Example time slots
app.get('/api/slots', (_req, res) => {
  const slots = [
    { start: '10:00', end: '11:00', status: 'past' },
    { start: '11:00', end: '12:00', status: 'past' },
    { start: '12:00', end: '13:00', status: 'past' },
    { start: '13:00', end: '14:00', status: 'available' },
    { start: '14:00', end: '15:00', status: 'available' },
    { start: '15:00', end: '16:00', status: 'available' },
    { start: '16:00', end: '17:00', status: 'available' },
    { start: '17:00', end: '18:00', status: 'available' },
    { start: '18:00', end: '19:00', status: 'available' },
    { start: '19:00', end: '20:00', status: 'available' },
    { start: '20:00', end: '21:00', status: 'available' },
    { start: '21:00', end: '22:00', status: 'available' },
    { start: '22:00', end: '23:00', status: 'available' },
    { start: '23:00', end: '00:00', status: 'available' },
    { start: '00:00', end: '01:00', status: 'available' },
    { start: '01:00', end: '02:00', status: 'reserved', reservedBy: '한진우' },
    { start: '02:00', end: '03:00', status: 'available' },
    { start: '03:00', end: '04:00', status: 'available' },
  ]
  res.json({ slots })
})

// API: Reserve a slot (requires login)
app.post('/api/reserve', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  const { start, end } = req.body || {}
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end are required' })
  }
  // TODO: persist to DB; for now, just echo back
  res.json({ ok: true, reserved: { start, end, by: req.user?.username || 'me' } })
})

app.listen(process.env["PORT"] || port);