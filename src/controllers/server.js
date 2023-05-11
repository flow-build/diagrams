require('dotenv').config();
const { logger } = require('../utils/logger');
const { getServerCore } = require('../diagramCore');
const { getToken, getFlowbuildWorkflows } = require('../services/flowbuildApi');
const emitter = require('../utils/eventEmitter');

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

const syncServer = async (ctx, next) => {
  logger.debug('syncServer controller called');
  const serverCore = getServerCore();
  const { id } = ctx.params;

  try {
    const server = await serverCore.getServer(id);

    if (!server) {
      ctx.status = 404;
      ctx.body = {
        message: 'No such server',
      };
      return;
    }

    const { token, error } = await getToken(server.url);

    if (error) {
      ctx.status = 502;
      ctx.body = { message: `Error trying to connect to server ${server.url}` };
      return;
    }

    const workflows = await getFlowbuildWorkflows(server.url, token);

    server.last_sync = new Date();
    emitter.emit('Sync server', { server, workflows, token });

    ctx.status = 202;
    ctx.body = {
      message: 'Sync server queued',
      server,
    };
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

module.exports = {
  saveServer,
  getAllServers,
  syncServer,
};
