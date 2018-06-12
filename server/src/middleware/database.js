const sql = require('promise-mysql');

async function routeConnection(req, res, next) {
  let conn = await createConnection(process.env.DB_HOST,
    process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_DATABASE);
  if (conn == null) {
    let error = new Error({success: false, message: "DB Connection error"})
    error.status = 500;
    error.body = {success: false, message: 'DB connection error'};
    return next(error);
  }
  res.locals.conn = conn;
  next();
}

async function createConnection(host, username, password, db) {
  try {
    return conn = await sql.createConnection({
      host: host,
      user: username,
      password: password,
      database: db,
    });
  }
  catch (error) {
    console.log('error: ', error);
    return null;
  }
}

async function isRegistered(email, conn, emailConfirmed = false) {
  
  let query = (!emailConfirmed) ? `SELECT email FROM users WHERE email = "${email}"` : `SELECT email FROM users WHERE email = "${email}" and emailConfirmed = 1`;

  let result = await conn.query(query);
  if (result[0]) {
    return true;
  }
  return false;
}

function sanitize(input, conn) {
  return conn.escape(input);
}

module.exports = {
  routeConnection,
  createConnection,
  isRegistered,
  sanitize,
};