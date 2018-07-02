const express = require('express');
var router = express.Router();
var Database = require('../middleware/database');

router.post('/joinFamily', async (req, res, next) => {
  console.log("join family");
  let conn = res.locals.conn;
  let email = res.locals.email;

  let token = req.body.token ? Database.sanitize(req.body.token, conn) : null;


  if (!token) {
    let error = new Error("Not all required fields were provided");
    error.status = 400;
    error.body = {success: false, message: 'Not all required fields were provided'};
    return next(error);
  }

  try {
    let query = 'BEGIN';
    await conn.query(query);

    //grab family key from temp table
    query = `SELECT familyKey FROM sharefamily WHERE token = "${token}"`;
    let result = await conn.query(query);

    if (!result || !result[0]) {
      let error = new Error('This family has not been shared with you');
      error.status = 403;
      error.body = {success: false, message: 'This family has not been shared with you'};
      return next(error);
    }

    let familyKey = result[0].familyKey;

    //check if user has already joined family
    query = `SELECT * FROM familyuser WHERE email="${email}" AND familyKey = "${familyKey}"`;
    result = await conn.query(query);
    if (result[0]) {
      let error = new Error("already joined this family");
      error.status = 409;
      error.body = {success: false, message: 'You are already a member of that family'};
      return next(error);
    }

    //let user join family
    query = `INSERT INTO familyuser(email, familyKey) VALUES("${email}", "${familyKey}")`;
    await conn.query(query);

    query = 'CONFIRM';
    await conn.query(query);

    res.status(200).send({success: true, message: 'Joined family'});
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

module.exports = router;
