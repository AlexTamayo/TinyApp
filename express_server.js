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


// URLS - POST
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL: longURL, userID: userId };

  if (!users[userId]) {
    return res.send(needToLogin);
  }

  res.redirect('/urls');
});


// REGISTER - POST
app.post("/register", (req, res) => {
  const id = generateRandomString(3);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPW = bcrypt.hashSync(password,10);

  if (!email || !password) {
    res.send(emailOrPassword);
    return res.status(400);
  }

  // email already in DB
  if (getUserByEmail(email, users)) {
    return res.status(400);
  }

  const registryObj = {
    id: id,
    email: email,
    password: hashedPW,
  };

  users[id] = registryObj;
  
  console.log(users);
  
  res.cookie('user_id', id);

  res.redirect('/urls');
});


// LOGIN - POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    res.send(emailOrPassword);
    return res.status(403);
  }


  if (!passwordMatch(password, user.password)) {
    res.send(emailOrPassword);
    return res.status(403);
  }

  req.session.user_id = user.id;

  res.redirect('/urls');
});


// LOGOUT - POST
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
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


// REDIRECT ID - GET
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    return res.status(404).send(fourOhFour);
  }

  res.redirect(longURL);
});


// URLS ID - POST
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;

  if (!users[userId]) {
    return res.send(needToLogin);
  }

  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL: newLongURL, userID: userId };

  res.redirect('/urls');
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
