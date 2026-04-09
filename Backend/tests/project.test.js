const request = require("supertest");
const app = require("../server");

describe("Project API", () => {
  let token;
  let projectId;

  beforeAll(async () => {
    // Assume user test runs first, or login
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@test.com",
        password: "password123"
      });
    token = res.body.accessToken;
  });

  test("Create project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Project",
        description: "Testing project API"
      });

    expect(res.statusCode).toBe(201);
    projectId = res.body._id;
  });

  test("Get projects", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});
