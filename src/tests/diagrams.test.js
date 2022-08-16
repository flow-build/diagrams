require('dotenv').config();
const { validate } = require('uuid');
const { v1: uuid } = require('uuid');
const supertest = require('supertest');
const { startServer } = require('../app');
const diagramSample = require('fs').readFileSync('./src/samples/diagram.xml', 'utf8');

let server;

beforeAll(async () => {
  server = startServer(5001);
  request = supertest(server);
})

afterAll(async () => {
  await server.close();
})

describe('POST /diagrams', () => {
  test('should return 201', async () => {
    const tokenResponse = await request.post('/token');
    const { jwtToken } = tokenResponse.body;
    const { user_id } = tokenResponse.body.payload;

    const lastResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test',
        diagram_xml: diagramSample
      })

    expect(lastResponse.status).toBe(201);
    expect(validate(lastResponse.body.id)).toBeTruthy();
    expect(lastResponse.body.user_id).toEqual(user_id);
    expect(lastResponse.body.name).toEqual('Test');
  });

  test('should return 400 if doesnt have name', async () => {
    const tokenResponse = await request.post('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        diagram_xml: diagramSample
      })

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Missing name');
  });

  test('should return 400 if doesnt have diagram_xml', async () => {
    const tokenResponse = await request.post('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test'
      })

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Missing diagram_xml');
  });
});

describe('GET /diagrams/:id', () => {
  test('should return 200 with the diagrams xml', async () => {
    const tokenResponse = await request.post('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test 1',
        diagram_xml: diagramSample
      });
    const diagram_id = postResponse.body.id;

    const lastResponse = await request.get(`/diagrams/${diagram_id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
  });

  test('should return 404 for non existing diagram_id', async () => {
    const diagram_id = uuid();
    const tokenResponse = await request.post('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get(`/diagrams/${diagram_id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(404);
    expect(lastResponse.body.message).toEqual('Diagram not found');
  });

  test('should return 400 invalid id', async () => {
    const tokenResponse = await request.post('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams/123456')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(400);
    expect(lastResponse.body.message).toEqual('Invalid id');
  });

});

describe('GET /diagrams', () => {
  test('should return 200 with all users diagrams', async () => {
    const tokenResponse = await request.post('/token');
    const { jwtToken } = tokenResponse.body;

    const lastResponse = await request.get('/diagrams')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
  });

});

describe('GET /workflows/:id/diagrams', () => {
  test('should return 200 with workflows diagrams', async () => {
    const tokenResponse = await request.post('/token');
    const { jwtToken } = tokenResponse.body;

    const postResponse = await request.post('/diagrams').type('form')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Test 2',
        diagram_xml: diagramSample,
        workflow_id: '7be513f4-98dc-43e2-8f3a-66e68a61aca8'
      });
    const { workflow_id } = postResponse.body;

    const lastResponse = await request.get(`/workflows/${workflow_id}/diagrams`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(lastResponse.status).toBe(200);
    expect(lastResponse.body).toBeDefined();
  });

});
