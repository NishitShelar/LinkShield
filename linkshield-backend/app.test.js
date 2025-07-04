import request from 'supertest';
import mongoose from 'mongoose';
import app from './server.js';

const testUser = {
  email: 'testuser@example.com',
  password: 'TestPass123!',
  name: 'Test User'
};

let authToken = '';

beforeAll(async () => {
  // Wait for DB connection
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }
});

afterAll(async () => {
  // Clean up test user
  await mongoose.connection.collection('users').deleteMany({ email: testUser.email });
  await mongoose.disconnect();
});

describe('API Integration Tests', () => {
  it('Health check should return healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('Should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect([200, 201, 400]).toContain(res.statusCode); // 400 if already exists
  });

  it('Should login and receive a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('Should access protected /api/auth/me route', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });
}); 