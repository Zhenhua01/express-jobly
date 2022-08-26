"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   * Takes optional query terms: {nameLike, minEmployees, maxEmployees} and
   * filters company database based on the search queries.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(search) {

    // if (search.minEmployees) {
    //   if (!(search.minEmployees)) {
    //     throw new BadRequestError("Min employees search must be a number");
    //   }
    // }
    // if (search.maxEmployees) {
    //   if (!(search.maxEmployees)) {
    //     throw new BadRequestError("Max employees search must be a number");
    //   }
    // }

    if (search.minEmployees > search.maxEmployees) {
      throw new BadRequestError(
        "Minimum employees cannot exceed maximum employees"
      );
    }

    const { searchParameters, searchArray } = Company.getSearchQuery(search);

    const companiesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
             FROM companies
             ${searchParameters}
             ORDER BY name`, searchArray);

    return companiesRes.rows;
  }

// doesn't have unit test yet

/** Given a search object data from req.query, returns 'searchParameters' and
 * 'searchArray' as an object for database query, where:
 *
 * searchParameters is a string for the 'WHERE' clause of the database query,
 * and searchArray is an array of search values.
 *
 *  * search object data can include:
 * { nameLike, minEmployees, maxEmployees }
 *
 * Returns: { searchParameters, searchArray } = { "WHERE ...", [values ...] }
 *
 * Returns an empty string and empty array if the search object is empty.
 */

  static getSearchQuery(search) {
    let searchArray = [];
    let searchParameters = "";

    for (let key in search) {
      if (searchArray.length === 0) {
        searchParameters += "WHERE ";
      } else {
        searchParameters += " AND ";
      }
      if (key === "nameLike") {
        searchArray.push(`%${search.nameLike}%`);
        searchParameters += `name ILIKE $${searchArray.length}`;
      }
      if (key === "minEmployees") {
        searchArray.push(search.minEmployees);
        searchParameters += `num_employees >= $${searchArray.length}`;
      }
      if (key === "maxEmployees") {
        searchArray.push(search.maxEmployees);
        searchParameters += `num_employees <= $${searchArray.length}`;
      }
    }

    return { searchParameters, searchArray };
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
