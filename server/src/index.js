const express = require('express');
if (!process.env.PRODUCTION) {
  require('dotenv-safe').config();//load environment variables
  console.log("localhost");
}

//routes
var loginRoute = require('./routes/login');
var registerRoute = require('./routes/register');
var confirmEmailRoute = require('./routes/confirmEmail');
var forgotPasswordRoute = require('./routes/forgotPassword');
var resetPasswordRoute = require('./routes/resetPassword');
var createFamilyRoute = require('./routes/createFamily');
var joinFamilyRoute = require('./routes/joinFamily');
var familyRoute = require('./routes/family');

//middleware
var authenticate = require('./middleware/authenticate');
var dbConnection = require('./middleware/database');

var server = express();

//***************************** MIDDLEWARE ***********************************
server.use(express.json());//parse json bodies
server.use(dbConnection.routeConnection);

//****************************** UNAUTORIZED ROUTES *************************
server.post('/login', loginRoute);
server.post('/register', registerRoute);
server.get('/confirmEmail', confirmEmailRoute);
server.post('/forgotPassword', forgotPasswordRoute);
server.post('/resetPassword', resetPasswordRoute);

//*************************** AUTHROIZED ROUTES ******************************
server.use(authenticate);
server.post('/createFamily', createFamilyRoute);
server.post('/joinFamily', joinFamilyRoute);
server.get('/family', familyRoute);

//********************************** ERROR HANDLING ****************************
server.use((error, req, res, next) => {  
  //close db connection
  if (res.locals.conn)
    res.locals.conn.end();

  if (error.status && error.body)
    res.status(error.status).send(error.body);
  else {
    console.log(error);
    res.status(500).send({success: false, message: 'Internal server error'});
  }
});

//********************************** 404 ERROR ********************************
server.use((req, res, next) => {
  if (res.locals.conn)
    res.locals.conn.end();
  res.status(404).send({success: false, message: 'path does not exist'});
});

//********************************* START SERVER ******************************
server.listen(process.env.PORT, () => {
  console.log("Listening on port: ", process.env.PORT);
});