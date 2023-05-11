const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const baseValidator = require('../validators/base');
const {
  diagramValidator,
  workflowValidator,
  serverValidator,
} = require('../validators/index');
const {
  diagramController,
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

  const diagram = new Router();
  diagram.prefix('/diagram');
  diagram.get(
    '/workflow/:id/latest',
    baseValidator.validateUUID,
    diagramController.getLatestDiagramByWorkflowId
  );
  diagram.get(
    '/:id',
    baseValidator.validateUUID,
    diagramController.getDiagramById
  );
  diagram.get('/', diagramController.getAllDiagrams);
  diagram.post(
    '/',
    diagramValidator.validateSaveDiagram,
    diagramController.saveDiagram
  );
  diagram.patch(
    '/:id',
    baseValidator.validateUUID,
    diagramValidator.validateUpdateDiagram,
    diagramController.updateDiagram
  );
  diagram.patch(
    '/:id/default',
    baseValidator.validateUUID,
    diagramController.setDefaultDiagram
  );
  diagram.del(
    '/:id',
    baseValidator.validateUUID,
    diagramController.deleteDiagram
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
  workflow.get(
    '/:id/default',
    baseValidator.validateUUID,
    workflowController.getDefaultDiagram
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

  router.use(diagram.routes());
  router.use(workflow.routes());
  router.use(server.routes());

  return router;
};
