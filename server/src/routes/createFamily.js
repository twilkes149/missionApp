const express = require('express');
var router = express.Router();
var Password = require('../common/password');
var Database = require('../middleware/database');
var jwt = require('../common/authToken');

router.post('/createFamily', async (req, res, next) => {
  console.log("create family");
  let conn = res.locals.conn;
  let email = res.locals.email;

  res.status(200).send({success: true, message: "families"});
});

module.exports = router;