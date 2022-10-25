const Koa = require('koa');
const koaLogger = require('koa-logger-winston');
const cors = require('koa2-cors');
const jwt = require('koa-jwt');
const { jwtSecret } = require('./utils/jwtSecret');
const { logger } = require('./utils/logger');
const { DiagramCore, BlueprintCore, 
  WorkflowCore, DiagramToWorkflowCore } = require('@flowbuild/diagrams-core');
const { db } = require('./utils/db');
const freeRouter = require('./routers/freeRouter');
const diagramsRouter = require('./routers/diagramsRouter');
const serve = require('koa-static');
const errorHandler = require('./middlewares/errorHandler');
const { getDiagramCore, setDiagramCore, getBlueprintCore, setBlueprintCore,  getWorkflowCore,
 setWorkflowCore, getDiagramToWorkflowCore, setDiagramToWorkflowCore } = require('./diagramCore');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();
const rTracer = require('cls-rtracer');
const emitter = require('../src/utils/eventEmitter');
const { startEventListener } = require('./services/eventListener');

const startServer = (port) => {
  
  let diagramCore = getDiagramCore();
  if (!diagramCore) {
    diagramCore = new DiagramCore(db);
    setDiagramCore(diagramCore);
  }

  let blueprintCore = getBlueprintCore();
  if (!blueprintCore) {
    blueprintCore = new BlueprintCore(db);
    setBlueprintCore(blueprintCore);
  }

  let workflowCore = getWorkflowCore();
  if (!workflowCore) {
    workflowCore = new WorkflowCore(db);
    setWorkflowCore(workflowCore);
  }

  let diagramToWorkflowCore = getDiagramToWorkflowCore();
  if (!diagramToWorkflowCore) {
    diagramToWorkflowCore = new DiagramToWorkflowCore(db);
    setDiagramToWorkflowCore(diagramToWorkflowCore);
  }

  const app = new Koa();

  const corsOptions = {
    origin: '*',
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }

  app.use(rTracer.koaMiddleware({
    echoHeader: true,
    useHeader: true,
    headerName: 'x-event-id'
  }));

  app.use(cors(corsOptions));
  app.use(koaLogger(logger));

  app.use(serve(pathToSwaggerUi, { index: false }))
  app.use(serve('public/swagger-ui', { index: false }))
  app.use(serve('src/swagger', { index: false }))

  app.use(errorHandler);
  
  app.use(freeRouter({ corsOptions }).routes());

  app.use(
    diagramsRouter({
      corsOptions,
      middlewares: [jwt({ secret: jwtSecret, debug: true })],
    }).routes()
  );
  
  startEventListener(emitter);

  return app.listen(port, () => {
    logger.info(`Server running on port: ${port}`)
  });
}

module.exports = {
  startServer
}