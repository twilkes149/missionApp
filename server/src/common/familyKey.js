//function to retrieve a list of family keys
async function getFamilyKeys(email, conn) {
  let query = `SELECT familyKey FROM familyuser WHERE email = "${email}"`;
  let familiyKeys = await conn.query(query);
  if (!familiyKeys || !familiyKeys[0]) {
    return false;
  }
  else {
    return familiyKeys;
  }
}

module.exports = {
  getFamilyKeys,
}