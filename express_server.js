const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000; // default port 8080


app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "def",
  },
  "9sm5xK": {
    longURL: "https://www.google.com",
    userID: "abc",
  },
  "54d5sd": {
    longURL: "https://www.alexandertamayo.com",
    userID: "ale",
  },
  "Rd7fh6": {
    longURL: "https://search.brave.com",
    userID: "ale",
  },
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
  ale: {
    id: "ale",
    email: "alex@t.com",
    password: "asd",
  },
};


// MESSAGES
const needToLog = 'You need to log in to be able to shorten URLs';
const emailOrPass = "either your email or password is wrong, fam";
const notYourss = "Bruv, this isn't yours to edit!!";
const fourOhFour = "That's a 404, bruv";


const generateRandomString = function(length) {
  return Math.random().toString(36).substring(2, length + 2);
};


const userEmail = function(email) {
  let foundUser = null;

  for (const userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return foundUser;
};


const userUrlObj = function(userId) {
  const userURLs = {};
  for (const urlID in urlDatabase) {

    if (urlDatabase[urlID].userID === userId) {
      userURLs[urlID] = urlDatabase[urlID].longURL;
    }
  }
  return userURLs;
};



// HOME - GET
app.get("/", (req, res) => {
  res.redirect('/login');
});


// URLS - GET
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: userUrlObj(userId),
    user: users[userId],
  };

  if (!users[userId]) {
    return res.status(403).send(needToLog);
  }

  res.render("urls_index", templateVars);
});


// NEW TINY URL - GET
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL: longURL, userID: userId };

  if (!users[userId]) {
    return res.send(needToLog);
  }

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

  res.cookie('user_id', id);

  res.redirect('/urls');
});


// LOGIN - POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userEmail(email);
  if (!user) {
    res.send(emailOrPass);
    return res.status(403);
  }

  if (user.password !== password) {
    res.send(emailOrPass);
    return res.status(403);
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});


// LOGOUT - POST
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


// URLS ID - GET
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies["user_id"];
  
  if (!urlDatabase[id]) {
    return res.status(404).send(fourOhFour);
  }
  
  if (!users[userId]) {
    return res.status(403).send(needToLog);
  }
  
  if (urlDatabase[id].userID !== userId) {
    return res.status(403).send(notYourss);
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
  const userId = req.cookies["user_id"];

  if (!users[userId]) {
    return res.send(needToLog);
  }

  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL: newLongURL, userID: userId };

  res.redirect('/urls');
});


// URL ID DELETE - POST
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies["user_id"];
  // const asd = userUrlObj(userId);
  
  if (!urlDatabase[id]) {
    return res.status(404).send(fourOhFour);
  }
  
  if (urlDatabase[id].userID !== userId) {
    return res.status(403).send(notYourss);
  }
  
  if (!users[userId]) {
    return res.status(403).send(needToLog);
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
