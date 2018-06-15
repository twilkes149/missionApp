const express = require('express');
var router = express.Router();
var Database = require('../middleware/database');

router.get('/family', async (req, res, next) => {
  console.log("family");
  let conn = res.locals.conn;
  let email = res.locals.email;

  try {
    //get a list of families this user belongs to
    let query = `SELECT name, familyKey FROM families AS p1 INNER JOIN familyuser AS p2 ON p1.key = p2.familyKey AND p2.email="${email}";`;
    let result = await conn.query(query);
    
    if (!result) {
      let error = new Error('No families were found for that email');
      error.status = 404;
      error.body = {success: false, message: 'No families wer found for that email'};
      return next(error);
    }
    res.status(200).send(result);
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
