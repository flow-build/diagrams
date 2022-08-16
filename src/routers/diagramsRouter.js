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
  diagrams
    .get('/user/:user_id/workflow/:workflow_id', 
      errorHandler, diagramsController.getDiagramsByUserAndWF
    );
  diagrams.get('/user/:id', errorHandler, diagramsController.getDiagramsByUserId);
  diagrams.get('/workflow/:id/latest', errorHandler, diagramsController.getLatestDiagramByWorkflowId);
  diagrams.get('/workflow/:id', errorHandler, diagramsController.getDiagramsByWorkflowId);
  diagrams.get('/:id', errorHandler, diagramsController.getDiagramById);
  diagrams.get('/', errorHandler, diagramsController.getAllDiagrams);
  diagrams.post('/', errorHandler, diagramsController.saveDiagram);
  diagrams.patch('/:id', errorHandler, diagramsController.updateDiagram);
  diagrams.del('/:id', errorHandler, diagramsController.deleteDiagram);

  router.use(diagrams.routes());
  
  return router; 
}