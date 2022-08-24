const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

const jsToSql = {
firstName: "first_name",
lastName: "last_name",
isAdmin: "is_admin",
}

describe("sql for partial update", function () {
  test("works: appropriate input", function () {
    const dataToUpdate = {
      firstName: "first",
      lastName: "last",
      password: "hashedpassword",
      email: "test@gmail.com",
      isAdmin: false
    }

    const results = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(results).toEqual({
        setCols: '"first_name"=$1, "last_name"=$2, "password"=$3, "email"=$4, "is_admin"=$5',
        values: ['first', 'last', 'hashedpassword', 'test@gmail.com', false]
    });
  });

  // test("doesn't work: invalid input", function () {
  //   const dataToUpdate = {};
  //   let results;

  //   try {
  //     results = sqlForPartialUpdate(dataToUpdate, jsToSql);
  //   } catch (BadRequestError) {
  //     return BadRequestError;
  //   }
  //   expect(BedRequest.status).toEqual(400);
    // expect(results.message).toEqual("No data");

  });