var jwt = require('jsonwebtoken');

function generateToken(email) {
  const payload = {
    type: 'user',
    email: email,
  };

  return jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: 60*60 //token valid for 1 hour
  });
}

function generateConfirmEmailToken() {
  const payload = {
    type: 'confirm',
  };

  return jwt.sign(payload, process.env.TOKEN_SECRET, {});
}

function verifyToken(token) {  
  return jwt.verify(token, process.env.TOKEN_SECRET, {});
}

module.exports = {
  generateToken,  
  generateConfirmEmailToken,
  verifyToken,
}