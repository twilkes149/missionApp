var Database = require('../middleware/database');
//inserts an event into the db, returns true or false
async function insertEvent(event, conn) {
  try {
    let query = `INSERT INTO events (title, description, lat, lng, address, personId, familyKey) VALUES("${event.title}", "${event.description}",   
      "${event.lat}", "${event.lng}", "${event.address}", "${event.personId}", "${event.familyKey}")`;
    await conn.query(query);
  }
  catch (error) {
    console.log("error inserting event", error);
    return false;
  }
  return true;
}

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
  insertEvent,
}