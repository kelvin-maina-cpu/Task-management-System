const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('User API Endpoints', () => {
  let token;
  const testEmail = `testuser${Date.now()}@test.com`;
  const testPassword = 'password123';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || process.env.TEST_DB_URI);
    }
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: testEmail,
        password: testPassword
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
    token = res.body.accessToken;
  });

  it('should get the user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email');
  });

  it('should fail profile without token', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    
    expect(res.statusCode).toEqual(401);
  });
});
