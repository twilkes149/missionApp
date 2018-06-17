var Database = require('../middleware/database');
var Events = require('./events');

//helper function to select a person from the database
async function selectPerson(id, conn) {
  try {
    id = id.replace(/^'|'$/g, '');
    id = parseInt(id);  
    
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
    console.log('error getting person', error);
    return false;
  }
}

async function selectFamilyKeyPerson(familyKey, conn) {
  try {
    familyKey = familyKey.replace(/^'|'$/g, '');
    familyKey = parseInt(familyKey);

    //grab all persons for this family
    let query = `SELECT * FROM person WHERE familyKey = "${familyKey}"`;
    let persons = await conn.query(query);

    if (!persons || !persons[0]) {//make sure there is at least one person
      return false;
    }

    //grab the events for every person
    persons = await persons.map(async (person) => {
      let personId = person.id;
      person.events = await Events.selectPersonEvents(personId, conn);
      return person;
    });

    persons = await Promise.all(persons);//wait until all events have been added    
    return persons;        
  }
  catch (error) {
    console.log('error getting persons', error);
    return false;
  }
}

//function to retrieve a person by id, or a list of persons by familyKey
async function getPerson(req, res, next) {
  console.log("get person");

  let conn = res.locals.conn;
  let email = res.locals.email;

  let id = (req.query.id) ? Database.sanitize(req.query.id, conn) : null;
  let familyKey = (req.query.familyKey) ? Database.sanitize(req.query.familyKey, conn) : null;
  let person = null;

  try {
    if (id) { //return a single person
      person = await selectPerson(id, conn);
    }
    else if (familyKey) {//return list of family members based on id
      person = await selectFamilyKeyPerson(familyKey, conn);      
    }
    else {
      let error = new Error('Not all required fields were provided');
      error.status = 400;
      error.body = {success: false, message: "Not all required fields were provided"};
      return next(error);
    }

    if (person) {
      res.status(200).send({success: true, message: "Got person(s)", person: person});
    }
    else {
      let error = new Error('No persons found');
      error.status = 404;
      error.body = {success: false, message: 'No persons found'};
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
  conn.end();
}

module.exports = {
  getPerson,
  postPerson,
}