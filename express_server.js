const express = require("express");
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, userUrlObj } = require('./helpers');
const { urlDatabase, users } = require('./database');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 3000; // default port 8080

const passwordMatch = bcrypt.compareSync;


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['secret-key'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


// MESSAGES
const needToLogin = 'You need to log in to be able to shorten URLs';
const emailOrPassword = "either your email or password is wrong, fam";
const notYours = "Bruv, this isn't yours to edit!!";
const fourOhFour = "That's a 404, bruv";


// HOME - GET
app.get("/", (req, res) => {
  res.redirect('/login');
});


// REGISTER - GET
app.get("/register", (req, res) => {
  const userId = req.session.user_id;

  const templateVars = {
    user: users[userId],
  };

  if (users[userId]) {
    return res.redirect('/urls');
  }

  res.render("urls_register", templateVars);
});


// REGISTER - POST
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send(emailOrPassword);
  }

  // email already in DB
  if (getUserByEmail(email, users)) {
    return res.status(400).send('email already exists');
  }

  const id = generateRandomString(3);
  const hashedPW = bcrypt.hashSync(password, 10);

  const userRegistryObj = {
    id: id,
    email: email,
    password: hashedPW,
  };

  users[id] = userRegistryObj;

  req.session.user_id = id;

  res.redirect('/urls');
});


// LOGIN - GET
app.get("/login", (req, res) => {
  const userId = req.session.user_id;

  const templateVars = {
    user: users[userId],
  };

  if (users[userId]) {
    return res.redirect('/urls');
  }

  res.render("urls_login", templateVars);
});


// LOGIN - POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send(emailOrPassword);
  }

  if (!passwordMatch(password, user.password)) {
    return res.status(403).send(emailOrPassword);
  }

  req.session.user_id = user.id;

  res.redirect('/urls');
});


// LOGOUT - POST
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


// URLS - GET
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  const templateVars = {
    urls: userUrlObj(userId, urlDatabase),
    user: users[userId],
  };

  if (!users[userId]) {
    return res.status(403).send(needToLogin);
  }

  res.render("urls_index", templateVars);
});


// URLS - POST
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!users[userId]) {
    return res.status(403).send(needToLogin);
  }

  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };

  res.redirect(`/urls/${shortURL}`);
});


// NEW TINY URL - GET
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  const templateVars = {
    user: users[userId],
  };

  if (!users[userId]) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});


// URLS ID - GET
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;

  if (!urlDatabase[id]) {
    return res.status(404).send(fourOhFour);
  }

  if (!users[userId]) {
    return res.status(403).send(needToLogin);
  }

  if (urlDatabase[id].userID !== userId) {
    return res.status(403).send(notYours);
  }

  const templateVars = {
    id: id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userId],
  };

  res.render("urls_show", templateVars);
});


// URLS ID - POST
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;

  if (!users[userId]) {
    return res.status(403).send(needToLogin);
  }

  if (!urlDatabase[id]) {
    return res.status(404).send(fourOhFour);
  }

  if (urlDatabase[id].userID !== userId) {
    return res.status(403).send(notYours);
  }

  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL: newLongURL, userID: userId };

  res.redirect('/urls');
});


// REDIRECT ID - GET
app.get("/u/:id", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send(fourOhFour);
  }

  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});


// URL ID DELETE - POST
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;

  if (!urlDatabase[id]) {
    return res.status(404).send(fourOhFour);
  }

  if (urlDatabase[id].userID !== userId) {
    return res.status(403).send(notYours);
  }

  if (!users[userId]) {
    return res.status(403).send(needToLogin);
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
