const Koa = require('koa');
const koaLogger = require('koa-logger-winston');
const cors = require('koa2-cors');
const { logger } = require('./utils/logger');
const { DiagramCore } = require('flowbuild-diagrams-core');
const { db } = require('./utils/db');
const freeRouter = require('./routers/freeRouter');
const diagramsRouter = require('./routers/diagramsRouter');
const serve = require('koa-static');
const errorHandler = require('./middlewares/errorHandler');
const { getDiagramCore, setDiagramCore } = require('./diagramCore');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()

const startServer = (port) => {
  
  let diagramCore = getDiagramCore();
  if (!diagramCore) {
    diagramCore = new DiagramCore(db);
    setDiagramCore(diagramCore);
  }

  const app = new Koa();

  const corsOptions = {
    origin: '*',
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }

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
      middlewares: [],
    }).routes()
  );

  return app.listen(port, () => {
    logger.info(`Server running on port: ${port}`)
  });
}

module.exports = {
  startServer
}