const express = require('express');
var router = express.Router();
var Database = require('../middleware/database');

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
    //create the family
    let query = `INSERT INTO families (name) VALUES ("${familyName}")`;
    await conn.query(query);

    //grab the auto generated family id
    query = `SELECT MAX(\`key\`) as \'key\' FROM families WHERE name = "${familyName}"`;
    let result = await conn.query(query);
    
    let key = result[0].key;//grab key of the family
    //let user join family
    query = `INSERT INTO familyuser(email, familyKey) VALUES("${email}", "${key}")`;
    await conn.query(query);

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