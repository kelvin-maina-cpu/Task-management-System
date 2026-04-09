const request = require("supertest");
const app = require("../server");

describe("Dashboard API", () => {
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

  test("Get dashboard stats", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});
