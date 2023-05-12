require('dotenv').config();
const { validate } = require('uuid');
const supertest = require('supertest');
const { startServer } = require('../app');
const { db } = require('../utils/db');
const blueprintSample = require('../samples/blueprint');
const diagramSample = require('fs').readFileSync(
  './src/samples/diagram.xml',
  'utf8'
);
const nock = require('nock');

let server;
let request;
let token;
const userId = 'e8089f89-2af7-433f-86de-993e4374c581';

beforeAll(async () => {
  server = startServer(5001);
  request = supertest(server);
  const tokenResponse = await request.post('/token').send({ userId });
  token = tokenResponse.body.jwtToken;
  return await db.raw('START TRANSACTION');
});

afterAll(async () => {
  await db.raw('ROLLBACK');
  await server.close();
});

describe('POST /diagram', () => {
  test('should return 201', async () => {
    const postResponse = await request
      .post('/diagram')
      .set('Authorization', `Bearer ${token}`)
      .send({
        xml: diagramSample,
        name: 'Diagram Test',
      });

    expect(postResponse.status).toBe(201);
    expect(postResponse.body).toBeDefined();
  });

  test('should return 400 if doesnt have blueprint_spec', async () => {
    const postResponse = await request
      .post('/workflow')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual(
      "must have required property 'blueprint_spec'"
    );
  });
});

describe('/server tests', () => {
  let server;
  describe('POST /server', () => {
    test('should return 201 for server saved', async () => {
      const response = await request
        .post('/server')
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: 'https://flowbuild-dev.com',
          namespace: 'develop',
        });

      server = response.body;
      expect(response.status).toBe(201);
      expect(validate(server.id)).toBeTruthy();
      expect(server.url).toEqual('https://flowbuild-dev.com');
      expect(server.namespace).toEqual('develop');
    });

    test('should return 400 if doesnt have url', async () => {
      const response = await request
        .post('/server')
        .set('Authorization', `Bearer ${token}`)
        .send({
          namespace: 'localhost',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual('Invalid Request Body');
      expect(response.body.errors[0].message).toEqual(
        "must have required property 'url'"
      );
    });
  });

  describe('GET /server', () => {
    test('should return 200 with all servers', async () => {
      const response = await request
        .get('/server')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(validate(response.body[0].id)).toBeTruthy();
      expect(response.body[0].url).toEqual('https://flowbuild-dev.com');
      expect(response.body[0].namespace).toEqual('develop');
    });
  });

  describe('POST /server/:id/sync', () => {
    test('should return 202 sync server queued', async () => {
      nock(server.url).post('/token').reply(200, {
        token: 'genericTestToken',
      });

      nock(server.url)
        .get('/workflows')
        .reply(200, [
          {
            workflow_id: 'c9e462d1-d937-11ed-8082-8dae5ebf27f6',
            created_at: '2023-04-12T13:41:55.197Z',
            name: 'testWorkflow',
            description: 'Workflow for test',
            version: 1,
          },
        ]);

      const response = await request
        .post(`/server/${server.id}/sync`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(202);
      expect(response.body.message).toEqual('Sync server queued');
      expect(response.body.server.last_sync).toBeDefined();
    });
  });
});

describe('POST /workflow', () => {
  test('should return 200', async () => {
    const postResponse = await request
      .post('/workflow')
      .set('Authorization', `Bearer ${token}`)
      .send({
        blueprint_spec: blueprintSample.blueprint_spec,
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toBeDefined();
  });

  test('should return 400 if doesnt have blueprint_spec', async () => {
    const postResponse = await request
      .post('/workflow')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual(
      "must have required property 'blueprint_spec'"
    );
  });
});

describe('PATCH /diagram/:id/default', () => {
  test('should return 200', async () => {
    const id = '5bc839ca-f3ce-4d76-9b68-cfcfb0b39be0';
    const { rows } = await db.raw(`
    insert into diagram (id,name,diagram_xml,user_id,is_public,user_default,is_aligned)
    values (
      '${id}',
      'test',
      '<book>Test</book>',
      '${userId}',
      false,
      false,
      false
    ) returning *`);

    expect(rows[0].user_default).toBe(false);
    const postResponse = await request
      .patch(`/diagram/${id}/default`)
      .set('Authorization', `Bearer ${token}`);

    expect(postResponse.status).toBe(200);
    expect(postResponse.body.isDefault).toBe(true);
  });

  test('should return 403', async () => {
    const id = '30760c29-db5f-4a08-b037-8d7d3b5d1ec5';
    await db.raw(`
    insert into diagram (id,name,diagram_xml,user_id,is_public,user_default,is_aligned)
    values (
      '${id}',
      'test',
      '<book>Test</book>',
      '7ec419de-e9b2-4f19-b6d6-5f17f6061ab8',
      false,
      false,
      false
    ) returning *`);

    const postResponse = await request
      .patch(`/diagram/${id}/default`)
      .set('Authorization', `Bearer ${token}`);

    expect(postResponse.status).toBe(403);
    expect(postResponse.body.message).toBe('FORBIDDEN');
  });
});

describe('POST /workflow/nobags', () => {
  test('should return 200', async () => {
    const postResponse = await request
      .post('/workflow/nobags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        blueprint_spec: blueprintSample.blueprint_spec,
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toBeDefined();
  });

  test('should return 400 if doesnt have blueprint_spec', async () => {
    const postResponse = await request
      .post('/workflow/nobags')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual(
      "must have required property 'blueprint_spec'"
    );
  });
});

describe('POST /workflow/usertask', () => {
  test('should return 200', async () => {
    const postResponse = await request
      .post('/workflow/usertask')
      .set('Authorization', `Bearer ${token}`)
      .send({
        blueprint_spec: blueprintSample.blueprint_spec,
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toBeDefined();
  });

  test('should return 400 if doesnt have blueprint_spec', async () => {
    const postResponse = await request
      .post('/workflow/usertask')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual(
      "must have required property 'blueprint_spec'"
    );
  });
});

describe('GET /workflow/:id/default', () => {
  test('should return 200 (getting public diagram)', async () => {
    await db.raw(`
    insert into diagram (id,name,diagram_xml,user_id,is_public,user_default,is_aligned)
    values (
      'f38ceaa7-051b-4093-9844-11de850df7ee',
      'test',
      '<book>Test</book>',
      '5a27bca2-ba42-4e45-bb7d-e9df06c9caad',
      true,
      false,
      false
    ) returning *`);

    const postResponse = await request
      .get('/workflow/2412a3e2-d076-4722-b7e1-17d72a6388d6/default')
      .set('Authorization', `Bearer ${token}`);

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toBeDefined();
  });
});

describe('GET /workflow/:id', () => {
  test('should return 200 (getting public diagram)', async () => {
    await db.raw(`
    insert into diagram (id,name,diagram_xml,user_id,is_public,user_default,is_aligned,blueprint_id)
    values (
      'f38ceaa7-051b-4093-9844-11de850df7ee',
      'test',
      '<book>Test</book>',
      '5a27bca2-ba42-4e45-bb7d-e9df06c9caad',
      true,
      false,
      false,
      '42a9a60e-e2e5-4d21-8e2f-67318b100e38'
    ), (
      'fadb2395-7352-4155-b253-0b9fadeb7640',
      'test',
      '<book>Test</book>',
      '${userId}',
      false,
      false,
      false,
      '42a9a60e-e2e5-4d21-8e2f-67318b100e38'
    ) returning *`);

    const postResponse = await request
      .get('/workflow/ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f')
      .set('Authorization', `Bearer ${token}`);

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toHaveLength(2);
    expect(postResponse.body[0].isPublic).toBe(false);
    expect(postResponse.body[1].isPublic).toBe(true);
  });
});
