const { v1: uuid } = require('uuid');
const { createJWTToken } = require('../services/tokenGenerator');
const { jwtSecret } = require('../utils/jwtSecret');

const getToken = (ctx, next) => {
  const secret = jwtSecret;
  const payload = {};
  payload.user_id  = ctx.request.body.user_id || uuid();

  const jwtToken = createJWTToken(payload, secret);
  ctx.status = 200;
  ctx.body = { 
    jwtToken,
    payload
  }

  return next();
}

module.exports = {
  getToken
}