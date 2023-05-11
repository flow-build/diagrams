const rs = require('jsrsasign');
const { logger } = require('../utils/logger');

const createJWTToken = (secret, duration, user_id) => {
  logger.debug('createJWTToken service called');

  const jwtHeader = { alg: 'HS256', typ: 'JWT' };

  const tNow = rs.KJUR.jws.IntDate.get('now');
  const tEnd = tNow + duration;
  const payload = {
    iat: tNow,
    exp: tEnd,
    user_id,
  };

  return rs.KJUR.jws.JWS.sign('HS256', jwtHeader, payload, { utf8: secret });
};

module.exports = {
  createJWTToken,
};
