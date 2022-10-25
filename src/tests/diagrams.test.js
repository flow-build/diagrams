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
  return await db.raw('START TRANSACTION');
});

afterAll(async () => {
  await db.raw('ROLLBACK');
  await server.close();
});

describe('POST /diagrams', () => {
  test('should return 201', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Save Diagram',
        diagram_xml: diagramSample,
        user_id: '1'
      })

    expect(postResponse.status).toBe(201);
    expect(validate(postResponse.body.id)).toBeTruthy();
    expect(postResponse.body.name).toEqual('Save Diagram');
  });

  test('should return 202 with eventListener - new workflow_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    nock(process.env.FLOWBUILD_URL)
      .get('/workflows/7be513f4-98dc-43e2-8f3a-66e68a61aca8')
      .reply(200, blueprintSample);

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Save Diagram With Workflow_id',
        diagram_xml: diagramSample,
        workflow_id: '7be513f4-98dc-43e2-8f3a-66e68a61aca8',
        user_id: '1'
      });

    expect(postResponse.status).toBe(202);
    expect(validate(postResponse.body.diagram.id)).toBeTruthy();
    expect(postResponse.body.message).toEqual('Diagram Created. Alignment Queued');
    expect(postResponse.body.diagram.name).toEqual('Save Diagram With Workflow_id');
    expect(postResponse.body.diagram.workflow_id).toEqual('7be513f4-98dc-43e2-8f3a-66e68a61aca8');
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

    const lastResponse = await request.get('/diagrams/d655538b-95d3-4627-acaf-b391fdc25142')
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

    const getResponse = await request.get('/diagrams/workflow/ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.length).toBeTruthy();
  });

  test('should return 404 for no diagram with workflow_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/workflow/ae8e95f6-343a-4c0b-8e1a-5cc122e7d04f')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(404);
    expect(getResponse.body.message).toEqual('No diagram with workflow_id: ae8e95f6-343a-4c0b-8e1a-5cc122e7d04f');
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

    const getResponse = await request.get('/diagrams/workflow/ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f/latest')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.workflow_id).toEqual('ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f');
  });

  test('should return 200 with alignment queued finished successfully', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/workflow/7be513f4-98dc-43e2-8f3a-66e68a61aca8/latest')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(validate(getResponse.body.id)).toBeTruthy();
    expect(getResponse.body.name).toEqual('Save Diagram With Workflow_id');
    expect(getResponse.body.workflow_id).toEqual('7be513f4-98dc-43e2-8f3a-66e68a61aca8');
    expect(getResponse.body.aligned).toBeTruthy();
  });

  test('should return 404', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/workflow/e5c39e03-b5ef-4aae-8339-1323675934cc/latest')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(404);
    expect(getResponse.body.message).toEqual('No diagram with workflow_id: e5c39e03-b5ef-4aae-8339-1323675934cc');
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

    const getResponse = await request.get('/diagrams/user/1')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.length).toBeTruthy();
  });

  test('should return 404 for no diagram with user_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/user/12')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(404);
    expect(getResponse.body.message).toEqual('No diagram with user_id: 12');
  });
});

describe('GET /diagrams/user/:user_id/workflow/:workflow_id', () => {
  test('should return 200 with diagrams of user_id and workflow_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/user/1/workflow/ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.length).toBeTruthy();
  });

  test('should return 404 for no diagram with workflow_id and user_id', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const getResponse = await request.get('/diagrams/user/12/workflow/f3362fcb-0469-45e7-a32f-8cc91edf7635')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(getResponse.status).toBe(404);
    expect(getResponse.body.message)
      .toEqual('No diagram with workflow_id: f3362fcb-0469-45e7-a32f-8cc91edf7635 and user_id: 12');
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

describe('PATCH /diagrams/:id', () => {
  test('should return 200 diagram updated name', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const patchResponse = await request.patch('/diagrams/d655538b-95d3-4627-acaf-b391fdc25142').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Update Example Diagram'
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.name).toEqual('Update Example Diagram');
    expect(patchResponse.body.aligned).toBeTruthy();
  });

  test('should return 200 diagram updated xml', async () => {
    const tokenResponse = await request.get('/token');
    const { jwtToken } = tokenResponse.body;

    const patchResponse = await request.patch('/diagrams/d655538b-95d3-4627-acaf-b391fdc25142').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        diagram_xml: diagramMisaligned
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.name).toEqual('Update Example Diagram');
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

    const patchResponse = await request.patch('/diagrams/d655538b-95d3-4627-acaf-b391fdc25142')
      .set('Authorization', `Bearer ${jwtToken}`)

    expect(patchResponse.status).toBe(400);
    expect(patchResponse.body.message).toEqual('Invalid Request Body');
    expect(patchResponse.body.errors[0].message).toEqual("must have required property 'name'");
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