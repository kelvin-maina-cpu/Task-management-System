const request = require("supertest");
const app = require("../server");

describe("Auth API", () => {
  const email = `test${Date.now()}@test.com`;
  const password = "password123";

  let token;

  test("Register user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email,
        password
      });

    expect(res.statusCode).toBe(201);
  });

  test("Login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");

    token = res.body.accessToken;
  });

  test("Get profile with token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});
