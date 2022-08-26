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

/************************************** GET /jobs */

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
    const { jobIds } = require("./_testCommon");
    const j1Id = jobIds[0];

    const resp = await request(app)
      .get("/jobs")
      .query({ title: 'j1' });

    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: j1Id,
            title: "j1",
            salary: 1000000,
            equity: "0.010",
            companyHandle: "c1",
          }
        ],
    });
  });

  test("ok for filter title, minSalary, hasEquity", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .get("/jobs")
      .query({
        title: "j",
        minSalary: "1100000",
        hasEquity: "true",
      });

    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: j2Id,
            title: "j2",
            salary: 1100000,
            equity: "0.005",
            companyHandle: "c2",
          },
        ],
    });
  });

  test("not ok for additional invalid filters", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ name: 'c' });

    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual(
      ["instance is not allowed to have the additional property \"name\""]);
  });

  test("not ok for invalid filter if salaray is non-integer", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ minSalary: "two million" });

    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual(
      ["instance.minSalary is not of a type(s) integer"]);
  });

});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app).get(`/jobs/${j2Id}`);
    expect(resp.body).toEqual({
      job:
      {
        id: j2Id,
        title: "j2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });

});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .patch(`/jobs/${j2Id}`)
      .send({
        title: "NewJ2",
      })
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.body).toEqual({
      job:
      {
        id: j2Id,
        title: "NewJ2",
        salary: 1100000,
        equity: "0.005",
        companyHandle: "c2",
      },
    });
  });

  test("unauth for anon", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .patch(`/jobs/${j2Id}`)
      .send({
        title: "NewJ2",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .patch(`/jobs/${j2Id}`)
      .set("authorization", `Bearer ${u1Token}`)
      .send({
        title: "NewJ2",
      });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Unauthorized");
  });

  test("not found resp for no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .patch(`/jobs/${j2Id}`)
      .send({
        companyHandle: "no company"
      })
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .patch(`/jobs/${j2Id}`)
      .send({
        title: 23,
        salary: "two million"
      })
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.statusCode).toEqual(400);
  });
});
/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .delete(`/jobs/${j2Id}`)
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.body).toEqual({ deleted: `${j2Id}` });
  });

  test("unauth for anon", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .delete(`/jobs/{${j2Id}}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admins", async function () {
    const { jobIds } = require("./_testCommon");
    const j2Id = jobIds[1];

    const resp = await request(app)
      .delete(`/jobs/{${j2Id}}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Unauthorized");
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${u1TokenAdmin}`);
    expect(resp.statusCode).toEqual(404);
  });

});