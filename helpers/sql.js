const { BadRequestError } = require("../expressError");


/** Given a user data object and an object of JS-to-SQL keys conversion,
 * returns an object with keys of 'setCols' and 'values' where 'setCols'
 * is a query string of columns to update for SQL and 'values' is an array
 * of values to be updated for each corresponding column
 *
 * 'dataToUpdate' can include:
 * { firstName, lastName, password, email, isAdmin }
 *
 * 'jsToSql' converts JS data keys to SQL column keys:
    { firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    }
 *
 * Returns:
    {
      setCols: "first_name=$1 age=$2 ..."
      values: ['Aliya', 32, ...]
    }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
