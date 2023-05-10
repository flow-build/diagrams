require('dotenv').config();
const { validate } = require('uuid');
const supertest = require('supertest');
const { startServer } = require('../app');
const { db } = require('../utils/db');
const blueprintSample = require('../samples/blueprint');

let server;
let request;
let token;

beforeAll(async () => {
  server = startServer(5001);
  request = supertest(server);
  const tokenResponse = await request.get('/token');
  token = tokenResponse.body.jwtToken;
  return await db.raw('START TRANSACTION');
});

afterAll(async () => {
  await db.raw('ROLLBACK');
  await server.close();
});

describe('POST /server', () => {
  test('should return 201 for server saved', async () => {
    const response = await request.post('/server')
      .set('Authorization', `Bearer ${token}`)
      .send({
        url: 'http://localhost:8080',
        namespace: 'localhost',
      });

    expect(response.status).toBe(201);
    expect(validate(response.body.id)).toBeTruthy();
    expect(response.body.url).toEqual('http://localhost:8080');
    expect(response.body.config.namespace).toEqual('localhost');
  });

  test('should return 400 if doesnt have url', async () => {
    const response = await request.post('/server')
      .set('Authorization', `Bearer ${token}`)
      .send({
        namespace: 'localhost',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Invalid Request Body');
    expect(response.body.errors[0].message).toEqual("must have required property 'url'");
  });
});

describe('GET /server', () => {
  test('should return 200 with all servers', async () => {
    const response = await request.get('/server')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(validate(response.body[0].id)).toBeTruthy();
    expect(response.body[0].url).toEqual('http://localhost:8080');
    expect(response.body[0].config.namespace).toEqual('localhost');
  });
});

describe('POST /workflow', () => {
  test('should return 200', async () => {
    const postResponse = await request.post('/workflow')
      .set('Authorization', `Bearer ${token}`)
      .send({
        blueprint_spec: blueprintSample.blueprint_spec
      })

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toBeDefined();
  });

  test('should return 400 if doesnt have blueprint_spec', async () => {
    const postResponse = await request.post('/workflow')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual("must have required property 'blueprint_spec'");
  });
});

describe('POST /workflow/nobags', () => {
  test('should return 200', async () => {
    const postResponse = await request.post('/workflow/nobags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        blueprint_spec: blueprintSample.blueprint_spec
      })

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toBeDefined();
  });

  test('should return 400 if doesnt have blueprint_spec', async () => {
    const postResponse = await request.post('/workflow/nobags')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual("must have required property 'blueprint_spec'");
  });
});

describe('POST /workflow/usertask', () => {
  test('should return 200', async () => {
    const postResponse = await request.post('/workflow/usertask')
      .set('Authorization', `Bearer ${token}`)
      .send({
        blueprint_spec: blueprintSample.blueprint_spec
      })

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toBeDefined();
  });

  test('should return 400 if doesnt have blueprint_spec', async () => {
    const postResponse = await request.post('/workflow/usertask')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual("must have required property 'blueprint_spec'");
  });
});