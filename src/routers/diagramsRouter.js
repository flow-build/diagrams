const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const errorHandler = require('../middlewares/errorHandler');
const diagramsController = require('../controllers/diagrams');

module.exports = (opts = {}) => {
  const router = new Router();

  router.use(bodyParser());

  for (let middleware of opts.middlewares) {
    router.use(middleware);
  }

  router.use(cors(opts.corsOptions));

  const diagrams = Router();
  diagrams.prefix('/diagrams');
  diagrams.post('/', errorHandler, diagramsController.saveDiagram);
  diagrams.get('/', errorHandler, diagramsController.getAllDiagramsByUserId);
  diagrams.get('/:id', errorHandler, diagramsController.getDiagramById);

  const workflows = Router();
  workflows.prefix('/workflows');
  workflows.get('/:id/diagrams', errorHandler, diagramsController.getDiagramsByWorkflowId);

  router.use(diagrams.routes());
  router.use(workflows.routes());
  
  return router; 
}