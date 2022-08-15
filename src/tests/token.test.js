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

describe('POST /token', () => {
  test('should return 200 without payload', async () => {
    const response = await request.post('/token');

    expect(response.status).toBe(200);
    expect(response.body.jwtToken).toBeDefined();
    expect(response.body.payload.actor_id).toBeDefined();
  });

  test('should use provided actor_id', async () => {
    const actorId = uuid();
    const response = await request.post('/token').send({ actor_id: actorId });

    expect(response.status).toBe(200);
    expect(response.body.jwtToken).toBeDefined();
    expect(response.body.payload.actor_id).toBe(actorId);
  });
});
