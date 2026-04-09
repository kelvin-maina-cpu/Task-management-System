const request = require("supertest");
const app = require("../server");

describe("Task API", () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@test.com",
        password: "password123"
      });

    token = res.body.accessToken;
  });

  test("Create task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Testing tasks API"
      });

    expect(res.statusCode).toBe(201);
  });

  test("Get tasks", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});
