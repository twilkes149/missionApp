const express = require('express');
var router = express.Router();
var Database = require('../middleware/database');
var Password = require('../common/password');

/*
* Response codes:
* 400 - user didn't supply all fields
* 403 - reset password token has expired
* 200 - success
* 500 - sql error
*/

router.post('/resetPassword', async (req, res, next) => {
  let conn = res.locals.conn;
  console.log("reset Password");

  let token = (req.body.token) ? Database.sanitize(req.body.token, conn) : null;
  let password = (req.body.password) ? Database.sanitize(req.body.password, conn) : null;

  //check if user supplied fields
  if (!token || !password) {
    let error = new Error("Not all fields were supplied");
    error.status = 400;
    error.body = {success: false, message: "Not all required fields were supplied"};
    return next(error);
  }

  try {
    let query = `SELECT email, createdat FROM forgotpassword WHERE value = "${token}"`;
    let result = await conn.query(query);

    let email = result[0].email;
    let createdAt = result[0].createdat;
    let elapsed = Date.now() - new Date(createdAt);
    elapsed = (elapsed / 1000) / 60; //convert elapsed time to minutes

    query = `DELETE FROM forgotpassword WHERE value = ${token}`;//delete the token from the db (it's only a 1 time use)
    await conn.query(query);
    
    if (elapsed > 60) {//only allow token to be valid for 1 hour
      let error = new Error("Token has expired");
      error.status = 403;
      error.body = {success: false, message: 'Token has expired'};
      return next(error);
    }

    //reset password
    password = await Password.hash(password);//hash the password
    query = `UPDATE users SET password = "${password}" WHERE email = "${email}"`;
    await conn.query(query);

    res.status(200).send({success: true, message: 'Successfully updated password'});
  }
  catch (error) {
    console.log(error);
    error = new Error("SQL error");
    error.status = 500;
    error.body = {success: false, message: 'Internal server error'};
    return next(error);
  }
  conn.end();
});

module.exports = router;