const rs = require('jsrsasign');

const createJWTToken = (secret) => {
  const jwtHeader = { alg: 'HS256', typ: 'JWT' };

  return rs.KJUR.jws.JWS.sign('HS256', jwtHeader, {}, { utf8: secret })
}

module.exports = {
  createJWTToken
};