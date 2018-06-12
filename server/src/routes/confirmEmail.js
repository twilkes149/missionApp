const express = require('express');
var router = express.Router();
var jwt = require('../common/authToken');

router.get('/confirmEmail', async (req, res, next) => {
  console.log('confirmEmail');

  let conn = res.locals.conn;
  let token = req.query.token;//grab the token from the get request  

  try {
    let payload = jwt.verifyToken(token);
    let query = `SELECT email FROM confirmtoken WHERE value = "${token}"`;
    let result = await conn.query(query);

    //if there are no tokens in db
    if (!result[0]) {
      let error = new Error('Invalid token supplied');
      error.status = 400;
      error.body = {success: false, message: 'Invalid token'}
      return next(error);
    }

    let email = result[0].email;

    //update user email
    query = `UPDATE users SET emailConfirmed = 1 WHERE email = "${email}"`;
    await conn.query(query);

    //delete token
    query = `DELETE from confirmtoken WHERE value = "${token}"`;
    await conn.query(query);

    res.status(200).send("<html><head><title>Email Confirmed</title></head><body><h1 style='text-align: center;'>&nbsp;</h1>" +
      "<h1 style='text-align: center;'>Thank you!</h1>" +
      "<p style='text-align: center;'>Your email has been confirmed.</p>" +
      "<hr />" +
      "<p style='text-align: center;''>&nbsp;</p></body></html>");

  }
  catch (error) {//token is invalid
    console.log(error);
    //handle jswon verify error
    if (error.name == 'JsonWebTokenError') {
      let error = new Error('Invalid token');
      error.status = 400;
      error.body = {success: false, message: "An invalid token was supplied"}

      return next(error);
    }
    else {//handle sql errors
      let error = new Error('SQL error');
      error.status = 500;
      error.body = {success: false, message: "Internal server error"};
      return next(error);
    }
  }
  conn.end();
});

module.exports = router;