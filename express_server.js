const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000; // default port 8080


app.set("view engine", "ejs");
app.use(cookieParser());


const urlDatabase = {
  "54d5sd": "http://www.alexandertamayo.com",
  "Rd7fh6": "http://search.brave.com",
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  abc: {
    id: "abc",
    email: "a@a.com",
    password: "123",
  },
  def: {
    id: "def",
    email: "d@d.com",
    password: "456",
  },
};


const generateRandomString = function(length) {
  return Math.random().toString(36).substring(2, length + 2);
};

// console.log(generateRandomString(6));

const userEmail = function(email) {
  let foundUser = null;

  for (const userId in users) {
    //
    if (email === users[userId].email) {
      return users[userId];
    }
  }

  return foundUser;

};

app.use(express.urlencoded({ extended: true }));


// HOME - GET
app.get("/", (req, res) => {
  res.redirect('/urls');
});


// URLS - GET
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});


// NEW TINY URL - GET
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  res.render("urls_new", templateVars);
});


// LOGIN - GET
app.get("/login",(req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  res.render("urls_login", templateVars);
});


// REGISTER - GET
app.get("/register",(req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  res.render("urls_register", templateVars);
});


// URLS - POST
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});


// REGISTER - POST
app.post("/register", (req, res) => {
  const id = generateRandomString(3);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    // res.send('No email or password');
    return res.status(400);
  }

  if (userEmail(email)) {
    // res.send('email already in DB');
    return res.status(400);
  }

  const registryObj = {
    id: id,
    email: email,
    password: password,
  };

  users[id] = registryObj;

  res.cookie('user_id',id);

  res.redirect('/urls');
});


// LOGIN - POST
app.post("/login",(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userEmail(email);
  if (!user) {
    // res.send("no such email in DB");
    return res.status(403);
  }
  
  if (user.password !== password) {
    // res.send("pasuworudo no machi");
    return res.status(403);
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});


// LOGOUT - POST
app.post("/logout",(req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


// URLS ID - GET
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});


// REDIRECT ID - GET
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


// URLS ID - POST
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});


// URL ID DELETE - POST
app.post("/urls/:id/delete",(req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});


// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
