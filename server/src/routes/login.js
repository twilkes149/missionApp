const express = require('express');
var router = express.Router();
var Password = require('../common/password');
var Database = require('../middleware/database');
var jwt = require('../common/authToken');

router.post('/login', async (req, res, next) => {
  console.log("login");
  let conn = res.locals.conn;

  //retrieve info
  let email = req.body.email ? Database.sanitize(req.body.email, conn) : null;
  let password = req.body.password ? Database.sanitize(req.body.password, conn) : null;

  //check if user supplied fields
  if (!email || !password) {
    let error = new Error("Not all fields were supplied");
    error.status = 400;
    error.body = {success: false, message: "Not all required fields were supplied"};
    return next(error);
  }

  try {    
    let query = `SELECT password FROM users WHERE email = "${email}"`;
    let result = await conn.query(query);

    //check if we got a result
    if (!(result[0] && result[0].password)) {
      let error = new Error("Invalid email/password");
      error.status = 401;
      error.body = {success: false, message: 'Invalid email/password'};
      return next(error);
    }

    //check if password matches
    let match = await Password.compare(password, result[0].password);    
    if (!match) {
      let error = new Error("Invalid email/password");
      error.status = 401;
      error.body = {success: false, message: 'Invalid email/password'};
      return next(error);
    }

    let token = jwt.generateToken();
    res.status(200).send({success: true, message: 'Successfully logged in', token: token});
  }
  catch (error) {    
    error.status = 500;
    error.body = {success: false, message: "SQL error"};
    return next(error);
  }
  conn.end();
});

module.exports = router;
