const { createJWTToken } = require('../services/tokenGenerator');
const { jwtSecret } = require('../utils/jwtSecret');

const getToken = (ctx, next) => {
  const secret = jwtSecret;

  const jwtToken = createJWTToken(secret);
  ctx.status = 200;
  ctx.body = { 
    jwtToken
  }

  return next();
}

module.exports = {
  getToken
}