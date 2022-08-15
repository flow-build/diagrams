const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const errorHandler = require('../middlewares/errorHandler');
const healthController = require('../controllers/healthCheck');
const tokenController = require('../controllers/token');

module.exports = (opts = {}) => {
  const router = new Router();

  router.use(bodyParser());
  router.use(cors(opts.corsOptions));

  router.get('/', errorHandler, healthController.healtchCheck);
  router.post('/token', errorHandler, tokenController.getToken);

  return router; 
}