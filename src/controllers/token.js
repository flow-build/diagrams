const { createJWTToken } = require('../services/tokenGenerator');
const { jwtSecret } = require('../utils/jwtSecret');
const { logger } = require('../utils/logger');

const getToken = (ctx, next) => {
  logger.debug('getToken controller called');

  const userId = ctx.request.body?.userId || null;
  if (userId) {
    const secret = ctx.get('x-secret') || jwtSecret;
    const duration = parseInt(ctx.get('x-duration')) || 3600;

    const jwtToken = createJWTToken(secret, duration, userId);
    ctx.status = 200;
    ctx.body = {
      jwtToken,
    };

    return next();
  }
  throw Error('No userId informed');
};

module.exports = {
  getToken,
};
