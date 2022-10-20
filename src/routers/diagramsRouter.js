const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const baseValidator = require('../validators/base');
const diagramsValidator = require('../validators/diagrams');
const diagramsController = require('../controllers/diagrams');

module.exports = (opts = {}) => {
  const router = new Router();

  router.use(bodyParser({
    formLimit: '1mb'
  }));

  for (let middleware of opts.middlewares) {
    router.use(middleware);
  }

  router.use(cors(opts.corsOptions));

  const diagrams = Router();
  diagrams.prefix('/diagrams');
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
  diagrams.get('/workflow/:id', baseValidator.validateUUID, diagramsController.getDiagramsByWorkflowId);
  diagrams.get('/:id', baseValidator.validateUUID, diagramsController.getDiagramById);
  diagrams.get('/', diagramsController.getAllDiagrams);
  diagrams.post('/', diagramsValidator.validateSaveDiagram, diagramsController.saveDiagram);
  diagrams.patch(
    '/:id',
    baseValidator.validateUUID,
    diagramsValidator.validateUpdateDiagram,
    diagramsController.updateDiagram
  );
  diagrams.del('/:id', baseValidator.validateUUID, diagramsController.deleteDiagram);

  router.use(diagrams.routes());
  
  return router; 
}