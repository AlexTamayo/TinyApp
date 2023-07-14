const generateRandomString = function(length) {
  return Math.random().toString(36).substring(2, length + 2);
};


const getUserByEmail = function(email, database) {

  for (const userId in database) {
    if (email === database[userId].email) {
      return database[userId];
    }
  }
  return null;
};


const userUrlObj = function(userId, urlDB) {
  const userURLs = {};
  for (const urlID in urlDB) {

    if (urlDB[urlID].userID === userId) {
      userURLs[urlID] = urlDB[urlID].longURL;
    }
  }
  return userURLs;
};


module.exports = { generateRandomString, getUserByEmail, userUrlObj };