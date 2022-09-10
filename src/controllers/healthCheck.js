const pkg = require('../../package.json')

const healtchCheck = async (ctx, next) => {
  ctx.status = 200;
  ctx.body = {
    message: 'Diagrams Server running',
    version: pkg.version,
    coreVersion: pkg.dependencies['@flowbuild/diagrams-core']
  }

  return next();
}

module.exports = {
  healtchCheck
}