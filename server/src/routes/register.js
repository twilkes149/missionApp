const express = require('express');
var router = express.Router();
var Database = require('../middleware/database');
var Password = require('../common/password');
var jwt = require('../common/authToken');
var mailSender = require('@sendgrid/mail');
/*
* Response codes:
* 400 - client didn't supply all fields
* 409 - email already exists
* 500 - something unknown happened
*/

router.post('/register', async (req, res, next) => {
  console.log("register");
  let conn = res.locals.conn;

  //retrieve info  
  let password = req.body.password ? Database.sanitize(req.body.password, conn) : null;
  let firstname = req.body.firstname ? Database.sanitize(req.body.firstname, conn) : null;
  let lastname = req.body.lastname ? Database.sanitize(req.body.lastname, conn) : null;
  let email = req.body.email ? Database.sanitize(req.body.email, conn) : null;

  //check if user supplied fields
  if (!password || !firstname || !lastname || !email) {
    let error = new Error("Not all fields were supplied");
    error.status = 400;
    error.body = {success: false, message: "Not all required fields were supplied"};
    return next(error);
  }

  //check if user previously registered
  if (await Database.isRegistered(email, conn)) {
    let error = new Error("Email already exists");
    error.status = 409;
    error.body = {success: false, message: 'Email already exists'};
    return next(error);
  }  

  password = await Password.hash(password);//hash the password
  try {
    let query = `INSERT INTO users (password, firstname, lastname, email) VALUES ("${password}", "${firstname}", "${lastname}", "${email}")`;
    await conn.query(query);
    
    let token = jwt.generateToken();
    await sendEmail(email, conn);//send confirmation email
    res.status(200).send({success: true, message: 'Successfuly registered', token: token});//generate auth token and return to client
  }
  catch (error) {
    console.log('error:', error);
    error.status = 500;
    error.body = {success: false, message: "SQL error"};
    return next(error);
  }
  conn.end();
});


async function sendEmail(email, conn) {

  let token = jwt.generateConfirmEmailToken();//generate random token
  let query = `INSERT INTO confirmtoken (value, email) VALUES ("${token}", "${email}")`;//insert token into db
  await conn.query(query);

  email = email.replace(/^'|'$/g, '');  
  //send email to client
  let msg = {
    to: `${email}`,
    from: process.env.MAIL_FROM_ADDRESS.replace(/^'|'$/g, ''),
    subject: 'Email confirmation',
    text: `Please take a moment to confirm your email by copy and pasting this link into your browser http://${process.env.SERVER_HOST}confirmEmail?token=${token}`,
    html: `<p><img style="display: block; margin-left: auto; margin-right: auto;" src="${process.env.MAIL_LOGO_SOURCE}" width="621" height="207" /></p>` +
      '<p>&nbsp;</p>' +
      '<p style="text-align: center;">You recently registered an email account with our app.&nbsp;</p>' +
      `<p style="text-align: center;">Please take a moment to confirm your email by clicking <a href='${process.env.SERVER_HOST}confirmEmail?token=${token}'>here</a> </p>` +
      `<p style="text-align: center;">or by copy and pasting this link into your browser <br /> http://${process.env.SERVER_HOST}confirmEmail?token=${token}</p>`+ 
      '<p style="text-align: center;">&nbsp;</p>' +
      '<p style="text-align: center;">If you feel you are receiving this email by mistake, please ignore it.',
  };
  mailSender.setApiKey(process.env.MAIL_TOKEN);
  mailSender.send(msg);
}

module.exports = router;
