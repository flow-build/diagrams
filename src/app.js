const Koa = require('koa');
const koaLogger = require('koa-logger-winston');
const cors = require('koa2-cors');
const jwt = require('koa-jwt');
const { jwtSecret } = require('./utils/jwtSecret');
const { logger } = require('./utils/logger');
const freeRouter = require('./routers/freeRouter');
const diagramsRouter = require('./routers/diagramsRouter');
const serve = require('koa-static');
const errorHandler = require('./middlewares/errorHandler');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()

const startServer = (port) => {
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
      middlewares: [jwt({ secret: jwtSecret, debug: true })],
    }).routes()
  );

  return app.listen(port, () => {
    logger.info(`Server running on port: ${port}`)
  });
}

module.exports = {
  startServer
}