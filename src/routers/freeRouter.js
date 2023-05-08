const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const fs = require('fs')
const healthController = require('../controllers/healthCheck');
const tokenController = require('../controllers/token');

module.exports = (opts = {}) => {
  const router = new Router();

  router.use(bodyParser());
  router.use(cors(opts.corsOptions));

  router.get('/token', tokenController.getToken);
  router.get('/', healthController.healtchCheck);
  router.get('/healthcheck', healthController.healtchCheck);
  router.get('/swagger', (ctx) => {
    ctx.type = 'text/html; charset=utf-8'
    ctx.body = fs.createReadStream('public/swagger-ui/index.html')
    return ctx;
  });

  return router; 
}