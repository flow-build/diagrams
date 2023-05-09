require('dotenv').config();
const { logger } = require('../utils/logger');
const { getServerCore } = require('../diagramCore');

const saveServer = async (ctx, next) => {
  logger.debug('saveServer controller called');
  const serverCore = getServerCore();

  try {
    const { url, namespace, brokerUrl } = ctx.request.body;
    const serverData = {
      url,
      config: {
        namespace,
        brokerUrl
      }
    }

    const server = await serverCore.saveServer(serverData);

    ctx.status = 201;
    ctx.body = server;
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

module.exports = {
  saveServer,
}