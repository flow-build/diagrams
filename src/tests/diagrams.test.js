require('dotenv').config();
const { v1: uuid, validate } = require('uuid');
const supertest = require('supertest');
const { startServer } = require('../app');
const { db } = require('../utils/db');
const diagramSample = require('fs').readFileSync('./src/samples/diagram.xml', 'utf8');
const diagramMisaligned = require('fs').readFileSync('./src/samples/diagramMisaligned.xml', 'utf8');
const blueprintSample = require('../samples/blueprint');
const nock = require('nock');

nock(process.env.FLOWBUILD_URL)
  .post('/token')
  .reply(200, {
    jwtToken: 'genericTestToken'
  });

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

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Save Diagram',
        diagram_xml: diagramSample,
        user_id: '1'
      })

    expect(postResponse.status).toBe(201);
    expect(validate(postResponse.body.id)).toBeTruthy();
    expect(postResponse.body.name).toEqual('Test Save Diagram');
  });

  test('should return 201', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    nock(process.env.FLOWBUILD_URL)
      .get('/workflows/7be513f4-98dc-43e2-8f3a-66e68a61aca8')
      .reply(200, blueprintSample);

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Save Diagram',
        diagram_xml: diagramSample,
        workflow_id: '7be513f4-98dc-43e2-8f3a-66e68a61aca8',
        user_id: '1'
      })

    expect(postResponse.status).toBe(201);
    expect(validate(postResponse.body.id)).toBeTruthy();
    expect(postResponse.body.name).toEqual('Test Save Diagram');
    expect(postResponse.body.workflow_id).toEqual('7be513f4-98dc-43e2-8f3a-66e68a61aca8');
    expect(postResponse.body.aligned).toBeTruthy();
  });

  test('should return 400 if doesnt have name', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        user_id: '2',
        diagram_xml: diagramSample
      })

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual("must have required property 'name'");
  });

  test('should return 400 if doesnt have diagram_xml', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Save Diagram',
        user_id: '3'
      })

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual("must have required property 'diagram_xml'");
  });

  test('should return 400 if doesnt have user_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Save Diagram',
        diagram_xml: diagramSample
      })

    expect(postResponse.status).toBe(400);
    expect(postResponse.body.message).toEqual('Invalid Request Body');
    expect(postResponse.body.errors[0].message).toEqual("must have required property 'user_id'");
  });

});

describe('GET /diagrams/:id', () => {
  test('should return 200 with the diagrams xml', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Diagram By Id',
        diagram_xml: diagramSample,
        workflow_id: '7be513f4-98dc-43e2-8f3a-66e68a61aca8',
        user_id: '1'
      });
    const { id } = postResponse.body;

    const lastResponse = await request.get(`/diagrams/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
    expect(lastResponse.body.message).not.toBeDefined();
  });

  test('should return 404 for non existing diagram_id', async () => {
    const diagram_id = uuid();
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get(`/diagrams/${diagram_id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(404);
    expect(getResponse.body.message).toEqual('Diagram not found');
  });

  test('should return 400 invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(400);
    expect(getResponse.body.message).toEqual('Invalid uuid');
  });
});

describe('GET /diagrams', () => {
  test('should return 200 with all diagrams', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Diagrams',
        diagram_xml: diagramSample,
        workflow_id: '7be513f4-98dc-43e2-8f3a-66e68a61aca8',
        user_id: '1'
      });

    const getResponse = await request.get('/diagrams')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.length).toBeTruthy();
  });
});

describe('GET /diagrams/workflow/:id', () => {
  test('should return 200 with all diagrams of workflow', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Diagrams By Workflow Id',
        diagram_xml: diagramSample,
        workflow_id: '5fefa640-e264-4481-a437-2adc3ceb6efa',
        user_id: '2'
      });

    const getResponse = await request.get('/diagrams/workflow/5fefa640-e264-4481-a437-2adc3ceb6efa')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.length).toBeTruthy();
  });

  test('should return 400 for invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/workflow/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(400);
    expect(getResponse.body.message).toEqual('Invalid uuid');
  });
});

describe('GET /diagrams/workflow/:id/latest', () => {
  test('should return 200 with the latest diagram of workflow', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Latest Diagram By Workflow Id',
        diagram_xml: diagramSample,
        workflow_id: 'fd4db5f9-0d50-4f53-8801-b12464f0dc52',
        user_id: '3'
      });

    const getResponse = await request.get('/diagrams/workflow/fd4db5f9-0d50-4f53-8801-b12464f0dc52/latest')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.workflow_id).toEqual('fd4db5f9-0d50-4f53-8801-b12464f0dc52');
  });

  test('should return 400 for invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/workflow/123456/latest')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(400);
    expect(getResponse.body.message).toEqual('Invalid uuid');
  });
});


describe('GET /diagrams/user/:id', () => {
  test('should return 200 with diagrams of user_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Diagrams By User Id',
        diagram_xml: diagramSample,
        workflow_id: '2210847e-8b61-4af7-9df7-73fd2b0bb24d',
        user_id: '2'
      });

    const getResponse = await request.get('/diagrams/user/2')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.length).toBeTruthy();
  });
});

describe('GET /diagrams/user/:user_id/workflow/:workflow_id', () => {
  test('should return 200 with diagrams of user_id and workflow_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Diagrams By User and Workflow Id',
        diagram_xml: diagramSample,
        workflow_id: 'd373bef0-1152-11ea-9576-9584815cab84',
        user_id: '3'
      });

    const getResponse = await request.get('/diagrams/user/3/workflow/d373bef0-1152-11ea-9576-9584815cab84')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.length).toBeTruthy();
  });

  test('should return 400 for invalid workflow_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/user/1/workflow/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(400);
    expect(getResponse.body.message).toEqual('Invalid uuid');
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

    const deleteResponse = await request.del(`/diagrams/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(deleteResponse.status).toBe(204);
  });

  test('should return 400 invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const deleteResponse = await request.del('/diagrams/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(deleteResponse.status).toBe(400);
    expect(deleteResponse.body.message).toEqual('Invalid uuid');
  });

  test('should return 404 for non existing diagram', async () => {
    const diagram_id = uuid();
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const deleteResponse = await request.del(`/diagrams/${diagram_id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(deleteResponse.status).toBe(404);
    expect(deleteResponse.body.message).toEqual('Diagram not found');
  });
});

describe('PATCH /diagrams/:id', () => {
  test('should return 200 diagram updated name', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    nock(process.env.FLOWBUILD_URL)
      .get('/workflows/44f43700-5128-11ec-baa3-5db1e80779a8')
      .reply(200, blueprintSample);
      
    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Update',
        diagram_xml: diagramSample,
        workflow_id: '44f43700-5128-11ec-baa3-5db1e80779a8',
        user_id: '8'
      });
    const { id } = postResponse.body;
    
    nock(process.env.FLOWBUILD_URL)
      .get('/workflows/44f43700-5128-11ec-baa3-5db1e80779a8')
      .reply(200, blueprintSample);

    const patchResponse = await request.patch(`/diagrams/${id}`).type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test Update Change Name',
        diagram_xml: diagramMisaligned
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.name).toEqual('Test Update Change Name');
    expect(patchResponse.body.workflow_id).toEqual('44f43700-5128-11ec-baa3-5db1e80779a8');
    expect(patchResponse.body.aligned).toBeFalsy();
  });

  test('should return 400 invalid id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const patchResponse = await request.patch('/diagrams/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(patchResponse.status).toBe(400);
    expect(patchResponse.body.message).toEqual('Invalid uuid');
  });

  test('should return 404 for non existing diagram', async () => {
    const diagram_id = uuid();
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const patchResponse = await request.patch(`/diagrams/${diagram_id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test 404',
        diagram_xml: diagramSample
      });

    expect(patchResponse.status).toBe(404);
    expect(patchResponse.body.message).toEqual('Diagram not found');
  });

  test('should return 400 if doesnt have name or diagram_xml', async () => {
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
    expect(patchResponse.body.message).toEqual('Invalid Request Body');
    expect(patchResponse.body.errors[0].message).toEqual("must have required property 'name'");
  });
});