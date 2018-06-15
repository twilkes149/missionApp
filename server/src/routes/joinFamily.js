const express = require('express');
var router = express.Router();
var Database = require('../middleware/database');

router.post('/joinFamily', async (req, res, next) => {
  console.log("join family");
  let conn = res.locals.conn;
  let email = res.locals.email;

  let familyKey = req.body.familyKey ? Database.sanitize(req.body.familyKey, conn) : null;
  if (!familyKey || typeof req.body.familyKey != "number") {
    let error = new Error("Family key not provided, or is not a number");
    error.status = 400;
    error.body = {success: false, message: 'Family key not provided, or is not a number'};
    return next(error);
  }

  try {
    //check if user has already joined family
    let query = `SELECT * FROM familyuser WHERE email="${email}" AND familyKey = "${familyKey}"`;
    let result = await conn.query(query);
    if (result[0]) {
      let error = new Error("already joined this family");
      error.status = 409;
      error.body = {success: false, message: 'You are already a member of that family'};
      return next(error);
    }

    //let user join family
    query = `INSERT INTO familyuser(email, familyKey) VALUES("${email}", "${familyKey}")`;
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
