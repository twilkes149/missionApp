const express = require('express');
var router = express.Router();
var mailSender = require('@sendgrid/mail');
var Database = require('../middleware/database');

router.post('/forgotPassword', async (req, res, next) => {
  console.log("forgotPassword");

  let conn = res.locals.conn;
  let email = (req.body.email) ? Database.sanitize(req.body.email, conn) : null;

  //check if user supplied fields
  if (!email) {
    let error = new Error("Not all fields were supplied");
    error.status = 400;
    error.body = {success: false, message: "Not all required fields were supplied"};
    return next(error);
  }

  let token = Database.sanitize(generateToken(6), conn);//generate token and sanitize, so it's the same format as every thing else

  try {
    //make sure the email belongs to a current user
    let result = await Database.isRegistered(email, conn, true)
    if (!result) { //if user doesn't exist
      let error = new Error('email doesn\'t exist');
      error.status = 400;
      error.body = {success: false, message: 'Email doesn\'t exist'};
      return next(error);
    }

    //save the email and token for future reference
    query = `INSERT INTO forgotpassword (value, email, createdat) VALUES ("${token}", "${email}", NOW())`;
    await conn.query(query);
    sendEmail(email, token);//send client their email
    res.status(200).send({success: true, message: 'Email successfuly sent'});
  }
  catch (error) {//handle sql errors    
    error = new Error("SQL error");
    error.status = 500;
    error.body = {success: false, message: 'Internal server error'};
    return next(error);
  }
  conn.end();
});

function generateToken(length) {
  let letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += letters[Math.floor(Math.random() * letters.length)];//get a random element of letters
  }
  return token;
}

async function sendEmail(email, token) {
  mailSender.setApiKey(process.env.MAIL_TOKEN);

  email = email.replace(/^'|'$/g, ''); 
  token = token.replace(/^'|'$/g, ''); 
  const msg = {
    to: email,
    from: process.env.MAIL_FROM_ADDRESS.replace(/^'|'$/g, ''),
    subject: 'Reset Password',
    text: `You recently request to reset your password through our app. Please do so, by entering this code into the app and following the onscreen instructions: ${token}`,
    html: '<p style="text-align: center;">You recently Requested to reset your password through our app.&nbsp;</p>' +
      `<p style="text-align: center;">Please copy and paste this token into the appropiate field in the app, and then following the on screen instructions</p>` +
      `<p style="text-align: center;"><b>${token}</b></p>` +
      '<p style="text-align: center;">If you feel you are receiving this email by mistake, please ignore it.&nbsp;</p>',
  };
  mailSender.send(msg);
}

module.exports = router;
