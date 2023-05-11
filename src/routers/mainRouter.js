const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const baseValidator = require('../validators/base');
const {
  diagramsValidator,
  workflowValidator,
  serverValidator,
} = require('../validators/index');
const {
  diagramsController,
  workflowController,
  serverController,
} = require('../controllers/index');

module.exports = (opts = {}) => {
  const router = new Router();

  router.use(
    bodyParser({
      formLimit: '1mb',
    })
  );

  for (let middleware of opts.middlewares) {
    router.use(middleware);
  }

  router.use(cors(opts.corsOptions));

  const diagrams = new Router();
  diagrams.prefix('/diagram');
  diagrams.get(
    '/user/:user_id/workflow/:workflow_id',
    baseValidator.validateUUID,
    diagramsController.getDiagramsByUserAndWF
  );
  diagrams.get('/user/:id', diagramsController.getDiagramsByUserId);
  diagrams.get(
    '/workflow/:id/latest',
    baseValidator.validateUUID,
    diagramsController.getLatestDiagramByWorkflowId
  );
  diagrams.get(
    '/workflow/:id',
    baseValidator.validateUUID,
    diagramsController.getDiagramsByWorkflowId
  );
  diagrams.get(
    '/:id',
    baseValidator.validateUUID,
    diagramsController.getDiagramById
  );
  diagrams.get('/', diagramsController.getAllDiagrams);
  diagrams.post(
    '/',
    diagramsValidator.validateSaveDiagram,
    diagramsController.saveDiagram
  );
  diagrams.patch(
    '/:id',
    baseValidator.validateUUID,
    diagramsValidator.validateUpdateDiagram,
    diagramsController.updateDiagram
  );
  diagrams.patch(
    '/:id/default',
    baseValidator.validateUUID,
    diagramsController.setDefaultDiagram
  );
  diagrams.del(
    '/:id',
    baseValidator.validateUUID,
    diagramsController.deleteDiagram
  );

  const workflow = new Router();
  workflow.prefix('/workflow');
  workflow.post(
    '/',
    workflowValidator.validateBuildDiagram,
    workflowController.buildDiagram
  );
  workflow.post(
    '/nobags',
    workflowValidator.validateBuildDiagram,
    workflowController.buildDiagramNoBags
  );
  workflow.post(
    '/usertask',
    workflowValidator.validateBuildDiagram,
    workflowController.buildDiagramUserTask
  );

  const server = new Router();
  server.prefix('/server');
  server.get('/', serverController.getAllServers);
  server.post(
    '/:id/sync',
    baseValidator.validateUUID,
    serverController.syncServer
  );
  server.post('/', serverValidator.validateServer, serverController.saveServer);

  router.use(diagrams.routes());
  router.use(workflow.routes());
  router.use(server.routes());

  return router;
};
