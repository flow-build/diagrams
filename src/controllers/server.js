require('dotenv').config();
const { logger } = require('../utils/logger');
const { getServerCore } = require('../diagramCore');

const saveServer = async (ctx, next) => {
  logger.debug('saveServer controller called');
  const serverCore = getServerCore();

  try {
    const serverData = ctx.request.body;

    const server = await serverCore.saveServer(serverData);

    ctx.status = 201;
    ctx.body = server;
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const getAllServers = async (ctx, next) => {
  logger.debug('getAllServers controller called');
  const serverCore = getServerCore();

  try {
    const servers = await serverCore.getAllServers();

    ctx.status = 200;
    ctx.body = servers;
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

module.exports = {
  saveServer,
  getAllServers,
};
