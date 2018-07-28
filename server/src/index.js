const express = require('express');
const fs = require('fs');//for reading ssl certificate
const https = require('https');
if (!process.env.PRODUCTION) {
  require('dotenv-safe').config();//load environment variables
  console.log("localhost");
}

//create ssl certificate options
const httpsOptions = {
  key: fs.readFileSync('../../../myserver.key'),
  cert: fs.readFileSync('../../../server.crt'),
  ca: [
      fs.readFileSync('./comodosha256domainvalidationsecureserverca.crt'),
      fs.readFileSync('./comodorsaaddtrustca.crt') 
   ]
};

//routes
var loginRoute = require('./routes/login');
var registerRoute = require('./routes/register');
var confirmEmailRoute = require('./routes/confirmEmail');
var forgotPasswordRoute = require('./routes/forgotPassword');
var resetPasswordRoute = require('./routes/resetPassword');
//family routes
var createFamilyRoute = require('./routes/createFamily');
var joinFamilyRoute = require('./routes/joinFamily');
var familyRoute = require('./routes/family');
var shareFamilyRoute = require('./routes/shareFamily');
//person routes
var personRoutes = require('./routes/person');
//event routes
var eventRoutes = require('./routes/events');


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
//family routes
server.post('/createFamily', createFamilyRoute);
server.post('/joinFamily', joinFamilyRoute);
server.get('/family', familyRoute);
server.post('/shareFamily', shareFamilyRoute);

//person routes
server.post('/person', personRoutes.postPerson);
server.get('/person', personRoutes.getPerson);
server.put('/person', personRoutes.putPerson);
server.delete('/person', personRoutes.deletePerson);

//event routes
server.post('/event', eventRoutes.postEvent);
server.get('/event', eventRoutes.getEvent);
server.put('/event', eventRoutes.putEvent);
server.delete('/event', eventRoutes.deleteEvent);

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
const httpsServer = https.createServer(httpsOptions, server).listen(process.env.PORT, () => {
  console.log('server running at ' + process.env.PORT);
});