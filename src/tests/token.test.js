require('dotenv').config();
const supertest = require('supertest');
const { startServer } = require('../app');

let server;
let request;

beforeAll(async () => {
  server = startServer(5001);
  request = supertest(server);
});

afterAll(async () => {
  await server.close();
});

describe('GET /token', () => {
  test('should return 200 without payload', async () => {
    const response = await request
      .post('/token')
      .send({ user_id: 'e8089f89-2af7-433f-86de-993e4374c581' });
    expect(response.status).toBe(200);
    expect(response.body.jwtToken).toBeDefined();
  });
});
