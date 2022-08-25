"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
// const { sqlForPartialUpdate } = require("../helpers/sql");

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

   static async findAll() {

    const jobsRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             ORDER BY id`);

    return jobsRes.rows;
  }


}

module.exports = Job;