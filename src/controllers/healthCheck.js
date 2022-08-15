const healtchCheck = async (ctx, next) => {
  ctx.status = 200;
  ctx.body = {
    message: 'Diagrams Server running'
  }

  return next();
}

module.exports = {
  healtchCheck
}