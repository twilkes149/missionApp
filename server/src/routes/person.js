var Database = require('../middleware/database');

//function to retrieve a person by id, or a list of persons by familyKey
async function getPerson(req, res, next) {
  console.log("get person");

  let conn = res.locals.conn;
  let email = res.locals.email;

  let id = (req.body.id) ? Database.sanitize(req.body.id, conn) : null;
  let familyKey = (req.body.familyKey) ? Database.sanitize(req.body.familyKey) : null;

  try {
    if (id) { //return a single 

    }
    else if (familyKey) {//return list of family members based on id

    }
    else {
      let error = new Error('Not all required fields were provided');
      error.status = 400;
      error.body = {success: false, message: "Not all required fields were provided"};
      return next(error);
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

//helper function to select a person from the database
async function selectPerson(id, conn) {
  try {
    //get the person
    let query = `SELECT * FROM person WHERE id = "${id}"`;
    let result = await conn.query(query);
    if (!result || !result[0]) {
      return false;
    }

    let person = result[0];//save the person

    //get all of the person's events
    query = `SELECT * FROM events WHERE personId = "${id}"`;
    result = await conn.query(query);
    if (!result || !result[0]) {
      return false;
    }
    person.events = result;
    return person;
  }
  catch (error) {
    return false;
  }
}

//function to insert a person, returns true of false
async function insertPerson(person, conn) {
  try {
    let query = '';

    //insert the person
    if (!person.description) {
      query = `INSERT INTO person (firstName, lastName, gender, familyKey) VALUES ("${person.firstName}", "${person.lastName}", "${person.gender}", "${person.familyKey}")`;
    }
    else {
      query = `INSERT INTO person (firstName, lastName, gender, description, familyKey) VALUES ("${person.firstName}", "${person.lastName}", "${person.gender}", "${person.description}", "${person.familyKey}")`;
    }
    let result = await conn.query(query);
    let personId = result.insertId;//getting the id of the most recently inserted person    

    //insert person's parents
    person.parents && person.parents.forEach(async (parentId) => {
      let query = `INSERT INTO parents (personId, parentId) VALUES ("${personId}", "${parentId}")`;
      await conn.query(query);
    });    
  }
  catch (error) {
    console.log('error inserting person', error);    
    return false;
  }
  return true;
}

//the function to handle the route for /person, Method: POST
async function postPerson(req, res, next) {
  console.log("post person");

  let conn = res.locals.conn;
  let email = res.locals.email;

  try {
    //make sure appropiate fields are present
    let person = req.body.person;
    if (!person || !person.firstName || !person.lastName || !person.gender || !person.familyKey) {
      let error = new Error('Not all required fields were provided');
      error.status = 400;
      error.body = {success: false, message: "Not all required fields were provided"};
      return next(error);
    }

    let query = `START TRANSACTION`;
    await conn.query(query);
    if (await insertPerson(person, conn)){
      query = `COMMIT`;
    }
    else {
      query = `ROLLBACK`;
    }
    await conn.query(query);

    if (query == `COMMIT`) {
      res.status(200).send({success: true, message: 'Added person'});
    }
    else {
      res.status(500).send({success: false, message: 'Error adding person'});
    }
  }
  catch (error) {
    console.log(error);
    error = new Error('SQL error');
    error.status = 500;
    error.body = {success: false, message: "SQL Error"};
    return next(error);
  }
}

module.exports = {
  getPerson,
  postPerson,
}