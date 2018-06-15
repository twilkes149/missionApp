const express = require('express');
var router = express.Router();
var Password = require('../common/password');
var Database = require('../middleware/database');
var jwt = require('../common/authToken');

router.post('/createFamily', async (req, res, next) => {
  console.log("create family");
  let conn = res.locals.conn;
  let email = res.locals.email;
  let familyName = req.body.familyName ? Database.sanitize(req.body.familyName, conn) : null;

  if (!familyName) {
    let error = new Error("Family name not provided");
    error.status = 400;
    error.body = {success: false, message: 'Family name not provided'};
    return next(error);
  }  

  try {
    let query = `INSERT INTO families (name) VALUES ("${familyName}")`;
    await conn.query(query);

    query = `SELECT MAX(\`key\`) as \'key\' FROM families WHERE name = "${familyName}"`;
    let result = await conn.query(query);
    
    let key = result[0].key;
    res.status(200).send({success: true, message: 'Created family', familyKey: key});
  }
  catch (error) {
    error = new Error('SQL error');
    error.status = 500;
    error.body = {success: false, message: "SQL Error"};
    return next(error);
  }
  conn.end();
});

module.exports = router;