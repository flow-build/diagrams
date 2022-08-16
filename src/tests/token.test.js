require('dotenv').config();
const { v1: uuid } = require('uuid');
const supertest = require('supertest');
const { startServer } = require('../app');

let server;

beforeAll(async () => {
  server = startServer(5001);
  request = supertest(server);
})

afterAll(async () => {
  await server.close();
})

describe('GET /token', () => {
  test('should return 200 without payload', async () => {
    const response = await request.get('/token');

    expect(response.status).toBe(200);
    expect(response.body.jwtToken).toBeDefined();
  });
});
