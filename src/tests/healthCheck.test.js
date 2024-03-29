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

describe('GET /', () => {
  test('should return 200', async () => {
    const response = await request.get('/');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Diagrams Server running');
  });
});

describe('GET /swagger', () => {
  test('should return 200', async () => {
    const response = await request.get('/swagger');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});
