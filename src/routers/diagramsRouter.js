const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
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
      diagramsController.getDiagramsByUserAndWF
    );
  diagrams.get('/user/:id', diagramsController.getDiagramsByUserId);
  diagrams.get('/workflow/:id/latest', diagramsController.getLatestDiagramByWorkflowId);
  diagrams.get('/workflow/:id', diagramsController.getDiagramsByWorkflowId);
  diagrams.get('/:id', diagramsController.getDiagramById);
  diagrams.get('/', diagramsController.getAllDiagrams);
  diagrams.post('/', diagramsController.saveDiagram);
  diagrams.patch('/:id', diagramsController.updateDiagram);
  diagrams.del('/:id', diagramsController.deleteDiagram);

  router.use(diagrams.routes());
  
  return router; 
}