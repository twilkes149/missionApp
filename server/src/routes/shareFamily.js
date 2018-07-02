const express = require('express');
var router = express.Router();
var Database = require('../middleware/database');


//this function creates a random token (saves it in db and sends token to client, so they can share it with their friends)
router.post('/shareFamily', async (req, res, next) => {
  console.log("share family");
  let conn = res.locals.conn;
  let email = res.locals.email;

  try {    
    let familyKey = req.body.familyKey ? Database.sanitize(req.body.familyKey, conn) : null;    
    familyKey = parseInt(familyKey.replace(/^'|'$/g, ''));
    console.log(familyKey, typeof familyKey);

    if (!familyKey) {
      let error = new Error("Not all required fields were provided");
      error.status = 400;
      error.body = {success: false, message: 'Not all required fields were provided'};
      return next(error);
    }

    //make sure this user is a part of the family
    let query = `SELECT * FROM familyuser WHERE email = "${email}" AND familyKey = "${familyKey}"`;
    let result = await conn.query(query);    

    if (!result || !result[0]) {//if there was not a result
      let error = new Error('You are not part of that family');
      error.status = 403;
      error.body = {success: false, message: 'You cannot share this family because you are not part of it'};
      return next(error);
    }

    let unSanitizedToken = generateToken(6);
    let token = Database.sanitize(unSanitizedToken, conn);//generate token and sanitize it, so it's in the same format later
    
    query = `INSERT INTO sharefamily (familyKey, token) VALUES("${familyKey}", "${token}")`;
    await conn.query(query);

    res.status(200).send({success: true, message: 'Added token', token: unSanitizedToken});
  }
  catch (error) {
    console.log(error);
    error = new Error('SQL error');
    error.status = 500;
    error.body = {success: false, message: "SQL Error"};
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

module.exports = router;