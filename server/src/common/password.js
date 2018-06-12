var bcrypt = require('bcrypt');
var saltRounds = 12;

async function hash(password) {
  return await bcrypt.hash(password, saltRounds);
}

async function compare(plaintext, hash) {
  return await bcrypt.compare(plaintext, hash);
}

module.exports = {
  hash,
  compare,
}