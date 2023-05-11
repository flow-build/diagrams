module.exports = async (ctx, next) => {
  let userId;
  try {
    const auth = ctx.request.headers?.authorization || '';

    const [, token] = auth.split(' ');
    const [, body] = token.split('.');

    const decoded = Buffer.from(body, 'base64').toString('utf8');
    const parsedBody = JSON.parse(decoded);
    userId = parsedBody.user_id;
  } catch (e) {
    throw new Error(`Malformed token. Error: ${e}`);
  }

  if (!userId) {
    throw new Error('Invalid user identification');
  }

  ctx.request['user_data'] = {
    user_id: userId,
  };
  await next();
};
