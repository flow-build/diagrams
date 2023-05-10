const { createJWTToken } = require('../services/tokenGenerator');
const { jwtSecret } = require('../utils/jwtSecret');
const { logger } = require('../utils/logger');

const getToken = (ctx, next) => {
  logger.debug('getToken controller called');

  const user_id = ctx.request.body?.user_id || null;
  if (user_id) {
    const secret = ctx.get("x-secret") || jwtSecret;
    const duration = parseInt(ctx.get("x-duration")) || 3600;

    const jwtToken = createJWTToken(secret, duration, user_id);
    ctx.status = 200;
    ctx.body = {
      jwtToken
    }

    return next();
  }
  throw Error('No user_id informed')
}

module.exports = {
  getToken
}