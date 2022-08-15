const { v1: uuid } = require('uuid');
const { createJWTToken } = require('../services/tokenGenerator');
const { jwtSecret } = require('../utils/jwtSecret');

const getToken = (ctx, next) => {
  const secret = jwtSecret;

  const body = ctx.request.body || {};
  if (!body?.user_id) {
    body.user_id = uuid();
  }

  const jwtToken = createJWTToken(body, secret);
  ctx.status = 200;
  ctx.body = { 
    jwtToken,
    payload: body
  }

  return next();
}

module.exports = {
  getToken
}