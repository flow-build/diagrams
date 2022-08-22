require('dotenv').config();
const { validate } = require('uuid');
const { v1: uuid } = require('uuid');
const supertest = require('supertest');
const { startServer } = require('../app');
const { db } = require('../utils/db');
const diagramSample = require('fs').readFileSync('./src/samples/diagram.xml', 'utf8');

let server;

beforeAll(async () => {
  server = startServer(5001);
  request = supertest(server);
})

beforeEach(() => {
  return db.raw('START TRANSACTION');
});

afterEach(() => {
  return db.raw('ROLLBACK');
});

afterAll(async () => {
  await server.close();
})

describe('POST /diagrams', () => {
  test('should return 201', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test',
        diagram_xml: diagramSample,
        user_id: '2'
      })

    expect(lastResponse.status).toBe(201);
    expect(validate(lastResponse.body.id)).toBeTruthy();
    expect(lastResponse.body.name).toEqual('Test');
  });

  test('should return 400 if doesnt have name', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        user_id: '3',
        diagram_xml: diagramSample
      })

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Missing name');
  });

  test('should return 400 if doesnt have diagram_xml', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test',
        user_id: '3'
      })

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Missing diagram_xml');
  });

  test('should return 400 if doesnt have user_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test',
        diagram_xml: diagramSample
      })

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Missing user_id');
  });

});

describe('GET /diagrams/:id', () => {
  test('should return 200 with the diagrams xml', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/d655538b-95d3-4627-acaf-b391fdc25142')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
  });

  test('should return 404 for non existing diagram_id', async () => {
    const diagram_id = uuid();
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get(`/diagrams/${diagram_id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(404);
    expect(lastResponse.body.message).toEqual('Diagram not found');
  });

  test('should return 400 invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Invalid id');
  });
});

describe('GET /diagrams', () => {
  test('should return 200 with all diagrams', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
  });
});

describe('GET /diagrams/workflow/:id', () => {
  test('should return 200 with all diagrams of workflow', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/workflow/7be513f4-98dc-43e2-8f3a-66e68a61aca8')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
  });

  test('should return 400 for invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/workflow/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Invalid workflow_id');
  });
});

describe('GET /diagrams/workflow/:id/latest', () => {
  test('should return 200 with all diagrams of workflow', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/workflow/7be513f4-98dc-43e2-8f3a-66e68a61aca8/latest')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body.workflow_id).toEqual('7be513f4-98dc-43e2-8f3a-66e68a61aca8');
  });

  test('should return 400 for invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/workflow/123456/latest')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Invalid workflow_id');
  });
});


describe('GET /diagrams/user/:id', () => {
  test('should return 200 with diagrams of user_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/user/1')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
  });
});

describe('GET /diagrams/user/:user_id/workflow/:workflow_id', () => {
  test('should return 200 with diagrams of user_id and workflow_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/user/1/workflow/7be513f4-98dc-43e2-8f3a-66e68a61aca8')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
  });

  test('should return 400 for invalid workflow_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/user/1/workflow/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Invalid workflow_id');
  });

});


describe('DELETE /diagrams/:id', () => {
  test('should return 204 deleting diagram', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Delete',
        diagram_xml: diagramSample,
        workflow_id: '44f43700-5128-11ec-baa3-5db1e80779a8',
        user_id: '6'
      });
    const { id } = postResponse.body;

    const lastResponse = await request.del(`/diagrams/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(204);
  });

  test('should return 400 invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.del('/diagrams/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Invalid id');
  });

  test('should return 404 for non existing diagram', async () => {
    const diagram_id = uuid();
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.del(`/diagrams/${diagram_id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(404);
    expect(lastResponse.body.message).toEqual('Diagram not found');
  });
});

describe('PATCH /diagrams/:id', () => {
  test('should return 200 diagram updated name', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Update',
        diagram_xml: diagramSample,
        workflow_id: '44f43700-5128-11ec-baa3-5db1e80779a8',
        user_id: '8'
      });
    const { id } = postResponse.body;

    const patchResponse = await request.patch(`/diagrams/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Update Change Name',
        diagram_xml: diagramSample,
        workflow_id: '44f43700-5128-11ec-baa3-5db1e80779a8'
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.name).toEqual('Test Update Change Name');
  });

  test('should return 400 invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.patch('/diagrams/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Invalid id');
  });

  test('should return 404 for non existing diagram', async () => {
    const diagram_id = uuid();
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.patch(`/diagrams/${diagram_id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test 404',
        diagram_xml: diagramSample,
        workflow_id: '44f43700-5128-11ec-baa3-5db1e80779a8'
      });

    expect(lastResponse.status).toBe(404);
    expect(lastResponse.body.message).toEqual('Diagram not found');
  });

  test('should return 400 for bad request', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Update',
        diagram_xml: diagramSample,
        workflow_id: '44f43700-5128-11ec-baa3-5db1e80779a8',
        user_id: '8'
      });
    const { id } = postResponse.body;

    const patchResponse = await request.patch(`/diagrams/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`)

    expect(patchResponse.status).toBe(400);
    expect(patchResponse.body.message).toEqual('Missing name or diagram_xml');
  });
});