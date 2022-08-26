"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a Job (from data), update db, return new job data.
  *
  * data should be { title, salary, equity, companyHandle }
  *
  * Returns { id, title, salary, equity, companyHandle }
  *
  * */

  static async create({ title, salary, equity, companyHandle }) {

    const result = await db.query(
      `INSERT INTO jobs(
            title,
            salary,
            equity,
            company_handle)
            VALUES
              ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        companyHandle
      ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [ { id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll(search) {

    const { searchParameters, searchArray } = Job.getSearchQuery(search);

    const jobsRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             ${searchParameters}
             ORDER BY id`, searchArray);

    return jobsRes.rows;
  }

  /** Given a search object data from req.query, returns 'searchParameters' and
 * 'searchArray' as an object for database query, where:
 *
 * searchParameters is a string for the 'WHERE' clause of the database query,
 * and searchArray is an array of search values.
 *
 * search object data can include:
 * { title, minSalary, hasEquity }
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
      } else if (search[key] !== false) {
        searchParameters += " AND ";
      }
      if (key === "title") {
        searchArray.push(`%${search.title}%`);
        searchParameters += `title ILIKE $${searchArray.length}`;
      }
      if (key === "minSalary") {
        searchArray.push(search.minSalary);
        searchParameters += `salary >= $${searchArray.length}`;
      }
      if (key === "hasEquity" && search.hasEquity === true) {
        searchParameters += `equity > 0`;
      }
    }

    if (search.hasEquity === false && searchArray.length === 0) {
      searchParameters = "";
     }

    return { searchParameters, searchArray };
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle  }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle",
      });
    const jobIdIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${jobIdIdx}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;

    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns job id.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
      [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);
  }
}

module.exports = Job;