const { logger } = require("../utils/logger");

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    logger.error(err);

    ctx.status = err.status || err.statusCode || 500;
    ctx.body = { message: err.message || 'Internal Server Error'}
    ctx.app.emit('error', err, ctx);
  }
}