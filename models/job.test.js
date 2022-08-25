"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  const newJob = {
    title: "newJob",
    salary: 99000,
    equity: 0,
    companyHandle: "c3",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "newJob",
      salary: 99000,
      equity: "0",
      companyHandle: "c3",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${job.id}`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "newJob",
        salary: 99000,
        equity: "0",
        company_handle: "c3",
      },
    ]);
  });

});

/************************************** findAll */
describe("findAll", function () {

  test("works: no filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 1000000,
        equity: "0.010",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 1200000,
        equity: "0",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(j1Id);
    expect(job).toEqual({

      id: j1Id,
      title: "j1",
      salary: 1000000,
      equity: 0.010,
      company_handle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "newTitle",
    salary: 1500000,
    equity: 0.007,
  };

  test("works", async function () {
    let job = await Job.update(j1Id, updateData);
    expect(job).toEqual({
      id: j1Id,
      ...updateData,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${j1Id}`);
    expect(result.rows).toEqual([{
      id: j1Id,
      title: "newTitle",
      salary: 1500000,
      equity: 0.007,
      company_handle: "c1"
    }]);

  });

});




