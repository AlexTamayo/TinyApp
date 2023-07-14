const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const actual = getUserByEmail("user@example.com", testUsers);
    const expected = testUsers["userRandomID"];
    assert.equal(actual, expected);
  });

  it('should return undefined if an email is not in our database', function() {
    const actual = getUserByEmail("a@example.com", testUsers);
    const expected = undefined;
    assert.equal(actual, expected);
  });

});
