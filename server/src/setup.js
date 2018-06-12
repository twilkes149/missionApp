/*
* This file is inteded to be run once at the beginning of the project
* It will read from a json file, and initilize a db with the information form the
* Json
*
* I never actually finished this script, because I realized I can just
* use mysql workbench to do this for me
* 
* Run this function with the following parameters <filename>
*
*/
var Database = require('./middleware/createDBConnection');
var jsonfile = require('jsonfile')
require('dotenv-safe').config();//load environment variables
var sql = require('promise-mysql');

setup();

async function setup() {
  let filePath = '';
  //parse command line arguements
  if (process.argv[2]) {
    filePath = process.argv[2];
    if (!filePath.match(/\.json/)) {
      console.log("Usage: must read a json file");
      return;
    }
  }
  else {
    console.log("Usage: node setup.js <json_filename>");
    return;
  }
  
  //parse json file
  try {
    let file = jsonfile.readFileSync(filePath);//reads file
    let dbName = null;    
    let tables = null;
    //now make sure we have everything we are expecting    
    if (!file.database) {
      throw new Error("Error in json file: Expected database object");
    }
    else if (!file.database.name) {
      throw new Error('Error in json file: Expected database object to have a name field');
    }
    else if (!file.database.tables) {
      throw new Error("Error in json file: Expected database object to have a list of tables");
    }
    dbName = file.database.name;
    tables = file.database.tables;
    //check each table, make sure it has a name and fields array
    file.database.tables.forEach((table, index) => {
      if (!table.name) {
        throw new Error(`Error in json file: Expected table ${index} to have a name field`);
      }
      else if (!table.fields) {
        throw new Error(`Error in json file: Expected table ${index} to have a fields array`);
      }

      //parse fields array, make sue each field has a name and type
      table.fields.forEach((field, fieldIndex) => {
        if (!field.name) {
          throw new Error(`Error in json file: Expected field ${fieldIndex} in table ${index} to have a name`);
        }
        else if (!field.type) {
          throw new Error(`Error in json file: Expected field ${fieldIndex} in table ${index} to have a type`);
        }
      });
    });

    //create database connection
    let conn = await Database.creatConnection(process.env.DB_HOST,'','', dbName);
    console.log("Successfully connected to database: " + dbName);
    
    //loop through each table and generate an sql statement for each
    tables.forEach((table) => {

    });

    conn.end();//ending connection
  }
  catch (error) {
    console.log(error);
  }

  
  return;
}