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
    equity: '0.010',
    companyHandle: "c3",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "newJob",
      salary: 99000,
      equity: "0.010",
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
        equity: "0.010",
        company_handle: "c3",
      },
    ]);
  });

});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    const { jobIds } = require("./_testCommon");
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "j1",
        salary: 1000000,
        equity: "0.010",
        companyHandle: "c1",
      },
      {
        id: jobIds[1],
        title: "j2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      },
      {
        id: jobIds[2],
        title: "j3",
        salary: 1200000,
        equity: "0",
        companyHandle: "c3",
      },
    ]);
  });

  test("works: filter title", async function () {
    const { jobIds } = require("./_testCommon");
    let jobs = await Job.findAll({ title: "J" });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "j1",
        salary: 1000000,
        equity: "0.010",
        companyHandle: "c1",
      },
      {
        id: jobIds[1],
        title: "j2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      },
      {
        id: jobIds[2],
        title: "j3",
        salary: 1200000,
        equity: "0",
        companyHandle: "c3",
      },
    ]);
  });

  test("works: filter minSalary", async function () {
    const { jobIds } = require("./_testCommon");
    let jobs = await Job.findAll({ minSalary: 1100000});
    expect(jobs).toEqual([
      {
        id: jobIds[1],
        title: "j2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      },
      {
        id: jobIds[2],
        title: "j3",
        salary: 1200000,
        equity: "0",
        companyHandle: "c3",
      }
    ]);
  });

  test("works: filter hasEquity=true", async function () {
    const { jobIds } = require("./_testCommon");
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "j1",
        salary: 1000000,
        equity: "0.010",
        companyHandle: "c1",
      },
      {
        id: jobIds[1],
        title: "j2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      }
    ]);
  });

  test("works: filter hasEquity=false", async function () {
    const { jobIds } = require("./_testCommon");
    let jobs = await Job.findAll({ hasEquity: false });
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "j1",
        salary: 1000000,
        equity: "0.010",
        companyHandle: "c1",
      },
      {
        id: jobIds[1],
        title: "j2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      },
      {
        id: jobIds[2],
        title: "j3",
        salary: 1200000,
        equity: "0",
        companyHandle: "c3",
      },
    ]);
  });

  test("works: filter title, minSalary, hasEquity=true", async function () {
    const { jobIds } = require("./_testCommon");
    let jobs = await Job.findAll({
                                  title: "J",
                                  minSalary: 1100000,
                                  hasEquity: true
                                });
    expect(jobs).toEqual([
      {
        id: jobIds[1],
        title: "j2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      }
    ]);
  });

  test("works: filter params in different order", async function () {
    const { jobIds } = require("./_testCommon");
    let jobs = await Job.findAll({
                                  title: "J",
                                  hasEquity: false,
                                  minSalary: 1100000,

                                });
      expect(jobs).toEqual([
        {
          id: jobIds[1],
          title: "j2",
          salary: 1100000,
          equity: "0.005",
          companyHandle: "c2",
        },
        {
          id: jobIds[2],
          title: "j3",
          salary: 1200000,
          equity: "0",
          companyHandle: "c3",
        }
    ]);
  });

});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const { jobIds } = require("./_testCommon");
    const j1Id = jobIds[0];
    let job = await Job.get(j1Id);
    expect(job).toEqual({
      id: j1Id,
      title: "j1",
      salary: 1000000,
      equity: "0.010",
      companyHandle: "c1",
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
    equity: 0.007
  };

  test("works", async function () {
    const { jobIds } = require("./_testCommon");
    const j1Id = jobIds[0];
    let job = await Job.update(j1Id, updateData);
    expect(job).toEqual({
      id: j1Id,
      title: "newTitle",
      salary: 1500000,
      equity: "0.007",
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${j1Id}`);
    expect(result.rows).toEqual([{
      id: j1Id,
      title: "newTitle",
      salary: 1500000,
      equity: "0.007",
      company_handle: "c1"
    }]);
  });

  test("works: null fields", async function () {
    const { jobIds } = require("./_testCommon");
    const j1Id = jobIds[0];
    const updateDataSetNulls = {
      title: "newTitle",
      salary: null,
      equity: null,
    };

    let job = await Job.update(j1Id, updateDataSetNulls);
    expect(job).toEqual({
      id: j1Id,
      title: "newTitle",
      salary: null,
      equity: null,
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${j1Id}`);
    expect(result.rows).toEqual([{
      id: j1Id,
      title: "newTitle",
      salary: null,
      equity: null,
      company_handle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    const { jobIds } = require("./_testCommon");
    const j1Id = jobIds[0];
    try {
      await Job.update(j1Id, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const { jobIds } = require("./_testCommon");
    const j1Id = jobIds[0];

    await Job.remove(j1Id);

    const res = await db.query(
      `SELECT id FROM jobs WHERE id=${j1Id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});




