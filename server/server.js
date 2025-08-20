const express = require('express')
const passport = require('passport');
const Strategy = require('passport-github').Strategy;
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
      callbackURL: "/return",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log("accessToken", accessToken);
      // In this example, the user's GitHub profile is supplied as the user
      // record.  In a production-quality application, the GitHub profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
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
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
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
    res.redirect("/");
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
    res.redirect("/");
  });
});

//http://localhost:4000/users
app.get('/users', (req, res) => { 
    //연결된 DBMS에 쿼리문을 날리고 응답을 콜백함수 매개변수 2번째값이 받는다.
    db.query('select * from people', (err,data) => {
        res.send(data) //클라이언트 에게 응답
    })
})

app.listen(process.env["PORT"] || port);