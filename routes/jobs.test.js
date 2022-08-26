"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u1TokenAdmin,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {

  const newJob = {
    title: "newJob",
    salary: 99000,
    equity: '0.010',
    companyHandle: "c3",
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job:
      {
        id: expect.any(Number),
        title: "newJob",
        salary: 99000,
        equity: "0.010",
        companyHandle: "c3",
      }
    });
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Unauthorized");
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 100000,
      })
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual(
      ["instance requires property \"companyHandle\""]);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        description: "newJob",
      })
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual(
      ["instance is not allowed to have the additional property \"description\""]);
  });

});

/************************************** GET /companies */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const { jobIds } = require("./_testCommon");
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
      [
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
      ],
    });
  });

  test("ok for search title", async function () {
    const resp = await request(app)
    .get("/jobs")
    .query({title: 'j1'});

    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: expect.any(Number),
            title: "j1",
            salary: 1000000,
            equity: "0.010",
            companyHandle: "c1",
          }
        ],
    });
  });

  test("ok for filter title, minSalary, hasEquity", async function () {
    const resp = await request(app)
    .get("/jobs")
    .query({
      title: "j",
      minSalary: '1100000',
      hasEquity: 'true',
    });

    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: expect.any(Number),
            title: "j2",
            salary: 1100000,
            equity: "0.005",
            companyHandle: "c2",
          },
        ],
    });
  });



});
