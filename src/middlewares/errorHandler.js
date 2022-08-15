module.exports = async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    if (!err.status) {
      ctx.status = 400;
      ctx.body = { message: err.message || 'Unknown Error'}
    } else {
      ctx.status = error.status;
      ctx.body = { message: err.message || 'Internal Server Error'}
    }
    ctx.app.emit('error', err, ctx);
  }
}