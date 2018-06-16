var Database = require('../middleware/database');

//function to get a list of events for a specific person
async function selectPersonEvents(personId, conn) {
  try {
    personId = personId.replace(/^'|'$/g, '');
    personId = parseInt(personId);  
    let query = `SELECT * FROM events WHERE personId = "${personId}"`;
    let result = await conn.query(query);

    if (!result || !result[0]) {//make sure there is at least one result
      return false;
    }
    else {
      return result;
    }
  }
  catch (error) {
    console.log('error getting events', error);
    return false;
  }
}

//function to get a list of events based on familyKey
async function selectFamilyKeyEvents(familyKey, conn) {
  try {
    familyKey = familyKey.replace(/^'|'$/g, '');
    familyKey = parseInt(familyKey,10);
    let query = `SELECT * FROM events WHERE familyKey = "${familyKey}"`;
    let result = await conn.query(query);  
    if (!result || !result[0]) {//make sure there is at least one result
      return false;
    }
    else {
      return result;
    }
  }
  catch (error) {
    console.log('get events error', error);
    return false;
  }
}

async function getEvent(req, res, next) {
  console.log("get event");

  let conn = res.locals.conn;
  let email = res.locals.email;

  try {
    let personId = req.query.personId ? Database.sanitize(req.query.personId, conn) : null;
    let familyKey = req.query.familyKey ? Database.sanitize(req.query.familyKey, conn) : null;
    let events = null;

    if (personId) {
      events = await selectPersonEvents(personId, conn);      
    }
    else if (familyKey) {
      events = await selectFamilyKeyEvents(familyKey, conn);
    }
    else {
      let error = new Error('Not all required fields were provided');
      error.status = 400;
      error.body = {success: false, message: "Not all required fields were provided"};
      return next(error);
    }    
    if (!events) {
      res.status(404).send({success: false, message: 'Could not find any events'});
    }
    else {
      res.status(200).send({success: true, message: 'got events', events: events});
    }
  }
  catch (error) {
    console.log(error);
    error = new Error('SQL error');
    error.status = 500;
    error.body = {success: false, message: "SQL Error"};
    return next(error);
  }
  conn.end();
}

//adds an event to the database
async function postEvent(req, res, next) {
  console.log("post event");

  let conn = res.locals.conn;
  let email = res.locals.email;

  let event = req.body.event;

  if (!event || !event.title || !event.personId || !event.familyKey) {
    let error = new Error('Not all required fields were provided');
    error.status = 400;
    error.body = {success: false, message: "Not all required fields were provided"};
    return next(error);
  }

  try {
    let query = `INSERT INTO events (title, description, lat, lng, address, personId, familyKey) VALUES("${event.title}", "${event.description}",   
      "${event.lat}", "${event.lng}", "${event.address}", "${event.personId}", "${event.familyKey}")`;
    await conn.query(query);

    res.status(200).send({success: true, message: 'Added event'});
  }
  catch (error) {
    console.log(error);
    error = new Error('SQL error');
    error.status = 500;
    error.body = {success: false, message: "SQL Error"};
    return next(error);
  }
  conn.end();
}

module.exports = {
  postEvent,
  getEvent,
}