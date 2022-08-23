const { logger } = require("../utils/logger");

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    logger.error(err);
    
    if (err.errors) {
      ctx.status = err.status || err.statusCode || 500;
      ctx.body = { 
        message: err.message || 'Internal Server Error',
        errors: err.errors
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