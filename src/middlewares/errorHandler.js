const { logger } = require("../utils/logger");

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    logger.error(err);
    
    if (err.error) {
      ctx.status = err.status || err.statusCode || 500;
      ctx.body = { 
        message: err.message || 'Internal Server Error',
        error: err.error
      }
    } else {
      ctx.status = err.status || err.statusCode || 500;
      ctx.body = { 
      message: err.message || 'Internal Server Error'
    }
    
    }
    ctx.app.emit('error', err, ctx);
  }
}