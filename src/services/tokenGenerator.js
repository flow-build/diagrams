const rs = require('jsrsasign');

const createJWTToken = (payload, secret) => {
  const jwtHeader = { alg: 'HS256', typ: 'JWT' };

  return rs.KJUR.jws.JWS.sign('HS256', jwtHeader, payload, { utf8: secret })
}

module.exports = {
  createJWTToken
};