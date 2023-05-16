require('dotenv').config();
const { startServer } = require('../app');
const supertest = require('supertest');
const { db } = require('../utils/db');
const { validate } = require('uuid');
const diagramSample = require('fs').readFileSync(
  './src/samples/diagram.xml',
  'utf8'
  );
const nock = require('nock');
const blueprintSample = require('../samples/blueprint');

let token;
let request;
let server;
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

    test('should return 400 for existing url', async () => {
      const response = await request
        .post('/server')
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: 'https://flowbuild-dev.com',
          namespace: 'develop',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        `Server already saved with url 'https://flowbuild-dev.com'`
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
      expect(response.body.server.lastSync).toBeDefined();
    });

    test('should return 400 for server syncing', async () => {
      const response = await request
        .post(`/server/${server.id}/sync`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual('Server already syncing');
    });
  });

  describe('DELETE /server/:id', () => {
    test('should return 204 for server deleted (without workflows)', async () => {
      const postResponse = await request
        .post('/server')
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: 'https://flowbuild-homolog.com',
          namespace: 'homolog',
        });

      const response = await request
        .delete(`/server/${postResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    test('should return 204 for server deleted and workflows/diagrams related', async () => {
      const postResponse = await request
        .post('/server')
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: 'https://flowbuild-homolog.com',
          namespace: 'homolog',
        });

      const blueprintId = 'acd582d1-e46f-11ed-99b5-9be1e7057c57';
      await db.raw(`
        insert into blueprint (id,blueprint_spec)
        values (
          '${blueprintId}',
          '${JSON.stringify(blueprintSample.blueprint_spec)}'
        ) returning *`);

      const diagramId = '920db220-e46e-11ed-99b5-9be1e7057c57';
      await db.raw(`
        insert into diagram (id,name,diagram_xml,user_id,blueprint_id,is_public,user_default,is_aligned)
        values (
          '${diagramId}',
          'diagram test',
          '<book>DiagramTest</book>',
          '7ec419de-e9b2-4f19-b6d6-5f17f6061ab8',
          '${blueprintId}',
          true,
          false,
          false
        ) returning *`);

      const workflowId = 'd23c52f0-dae8-11ed-9c3f-490ac62bb231';
      await db.raw(`
      insert into workflow (id,name,version,server_id,blueprint_id)
      values (
        '${workflowId}',
        'workflow test',
        1,
        '${postResponse.body.id}',
        '${blueprintId}'
      ) returning *`);

      const response = await request
        .delete(`/server/${postResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    test('should return 404 for server not found', async () => {
      const response = await request
        .delete(`/server/be453c12-c2ad-46cf-b8fd-2e84fe7e6c26`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Server not found');
    });

    test('should return 400 for server syncing', async () => {
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

      await request
        .post(`/server/${server.id}/sync`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request
        .delete(`/server/${server.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        'Server syncing, cannot be deleted right now'
      );
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

describe('/diagram tests', () => {
  let diagramId;
  describe('POST /diagram', () => {
    test('should return 201', async () => {
      const postResponse = await request
        .post('/diagram')
        .set('Authorization', `Bearer ${token}`)
        .send({
          xml: diagramSample,
          name: 'Diagram Test',
        });

      diagramId = postResponse.body.id;
      expect(postResponse.status).toBe(201);
      expect(postResponse.body).toBeDefined();
      expect(validate(diagramId)).toBeTruthy();
      expect(postResponse.body.name).toEqual('Diagram Test');
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
      insert into diagram (id,name,diagram_xml,user_id,is_public,user_default,is_aligned,blueprint_id)
      values (
        '${id}',
        'test',
        '<book>Test</book>',
        '${userId}',
        false,
        false,
        false,
        '42a9a60e-e2e5-4d21-8e2f-67318b100e38'
      ) returning *`);

      expect(rows[0].user_default).toBe(false);
      const response = await request
        .patch(`/diagram/${id}/default`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.isDefault).toBe(true);
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

      const response = await request
        .patch(`/diagram/${id}/default`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('FORBIDDEN');
    });
  });

  describe('PATCH /diagram/:id', () => {
    test('should return 201', async () => {
      const response = await request
        .patch(`/diagram/${diagramId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          xml: diagramSample,
          name: 'Upgraded Diagram',
          isPublic: true,
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.id).toEqual(diagramId);
      expect(response.body.name).toEqual('Upgraded Diagram');
      expect(response.body.isPublic).toBeTruthy();
    });

    test('should return 400 for invalid diagram id', async () => {
      const response = await request
        .patch(`/diagram/123456`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Upgraded Diagram',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual('Invalid uuid');
    });
  });

  describe('GET /diagram/:id', () => {
    test('should return 200 with diagram xml', async () => {
      const response = await request
        .get(`/diagram/${diagramId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    test('should return 404 for diagram not found', async () => {
      const response = await request
        .get(`/diagram/be453c12-c2ad-46cf-b8fd-2e84fe7e6c26`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Diagram not found');
    });
  });

  describe('DELETE /diagram/:id', () => {
    test('should return 204 for diagram deleted', async () => {
      const response = await request
        .delete(`/diagram/${diagramId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    test('should return 404 for diagram not found', async () => {
      const response = await request
        .get(`/diagram/be453c12-c2ad-46cf-b8fd-2e84fe7e6c26`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Diagram not found');
    });
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

describe('GET /workflow', () => {
  beforeAll(async () => {
    await db.raw(`
    insert into diagram (id,name,diagram_xml,user_id,is_public,user_default,is_aligned,blueprint_id)
    values (
      '4b6bef81-4d54-40f4-b239-b5036d5c4335',
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
  });

  test('GET /workflow/:id/default should return 200 (getting public diagram)', async () => {
    const response = await request
      .get('/workflow/ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f/default')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  test('GET /workflow/:id should return 200 (getting public diagram)', async () => {
    const response = await request
      .get('/workflow/ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].isPublic).toBe(true);
    expect(response.body[1].isPublic).toBe(false);
    expect(response.body[2].isPublic).toBe(false);
  });
});
