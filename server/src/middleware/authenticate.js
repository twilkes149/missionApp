var Database = require('./database');
var jwt = require('../common/authToken');

async function authenticate(req, res, next) {
  let authToken = req.body.authToken ? req.body.authToken : req.query.authToken;//grab authToken from the post request or get request

  if (!authToken) {
    let error = new Error('User not authorized');
    error.status = 401;
    error.body = {success: false, message: 'User not authorized. Try logging in again.'};
    return next(error);
  }
  try {
    let payload = await jwt.verifyToken(authToken);//verify the jwt
    let email = payload.email;

    if (!email) {
      let error = new Error('User not authorized');
      error.status = 401;
      error.body = {success: false, message: 'User not authorized. Try loggin in again.'};
      return next(error);
    }

    res.locals.email = email;//pass client's email down the line
    next();
  }
  catch (error) {
    error = new Error('User not authorized');
    error.status = 401;
    error.body = {success: false, message: 'User not authorized. Try logging in again.'};
    return next(error);
  }
}

module.exports = authenticate;
