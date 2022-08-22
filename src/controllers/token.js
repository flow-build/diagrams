const { createJWTToken } = require('../services/tokenGenerator');
const { jwtSecret } = require('../utils/jwtSecret');

const getToken = (ctx, next) => {
  const secret = ctx.get("x-secret") || jwtSecret;
  const duration = parseInt(ctx.get("x-duration")) || 3600;

  const jwtToken = createJWTToken(secret, duration);
  ctx.status = 200; 
  ctx.body = { 
    jwtToken
  }

  return next();
}

module.exports = {
  getToken
}