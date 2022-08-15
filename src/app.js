const Koa = require('koa');
const koaLogger = require('koa-logger');
const cors = require('koa2-cors');
const jwt = require('koa-jwt');
const { jwtSecret } = require('./utils/jwtSecret');
const { logger } = require('./utils/logger');
const freeRouter = require('./routers/freeRouter');
const diagramsRouter = require('./routers/diagramsRouter');

const startServer = (port) => {
  const app = new Koa();

  const corsOptions = {
    origin: '*',
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }

  app.use(cors(corsOptions));
  app.use(koaLogger(logger));
  
  app.use(freeRouter({ corsOptions }).routes());

  app.use(
    diagramsRouter({
      corsOptions,
      middlewares: [jwt({ secret: jwtSecret, debug: true })],
    }).routes()
  );

  return app.listen(port, () => {
    logger.info(`Diagrams Server running on port: ${port}`)
  });
}

module.exports = {
  startServer
}