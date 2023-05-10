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
        config: {
          namespace: 'localhost',
        },
      });

    expect(response.status).toBe(201);
    expect(validate(response.body.id)).toBeTruthy();
  });

  test('should return 400 if doesnt have url', async () => {
    const response = await request.post('/server')
      .set('Authorization', `Bearer ${token}`)
      .send({
        config: {
          namespace: 'localhost',
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Invalid Request Body');
    expect(response.body.errors[0].message).toEqual("must have required property 'url'");
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

describe('POST /default', () => {
  test('should return 200', async () => {
    const id = 'da55b972-74d4-4156-bf4f-75ca31b5b52f';
    const { rows } = await db.raw(`
    insert into diagram (id,name,diagram_xml,user_id,is_public,user_default,is_aligned)
    values (
      '${id}',
      'test',
      '<book>Test</book>',
      '7ec419de-e9b2-4f19-b6d6-5f17f6061ab8',
      false,
      false,
      false
    ) returning *`)

    expect(rows[0].user_default).toBe(false);
    const postResponse = await request.patch(`/diagrams/${id}/default`)
      .set('Authorization', `Bearer ${token}`);

    expect(postResponse.status).toBe(200);
    expect(postResponse.body.user_default).toBe(true);
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