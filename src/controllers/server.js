require('dotenv').config();
const { logger } = require('../utils/logger');
const {
  getServerCore,
  getWorkflowCore,
  getBlueprintCore,
  getDiagramCore,
} = require('../diagramCore');
const { getToken, getFlowbuildWorkflows } = require('../services/flowbuildApi');
const emitter = require('../utils/eventEmitter');

const serializeServer = (server) => {
  return {
    id: server.id,
    url: server.url,
    namespace: server.namespace,
    syncing: server.is_syncing,
    config: server.config,
    lastSync: server.last_sync,
  };
};

const saveServer = async (ctx, next) => {
  logger.debug('saveServer controller called');
  const serverCore = getServerCore();

  try {
    const serverData = ctx.request.body;

    const server = await serverCore.saveServer(serverData);

    ctx.status = 201;
    ctx.body = serializeServer(server);
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
    ctx.body = servers.map((server) => serializeServer(server));
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

    if (server.is_syncing) {
      ctx.status = 400;
      ctx.body = {
        message: 'Server already syncing',
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

    server.is_syncing = true;
    await serverCore.updateServer(server.id, server);
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

const deleteServer = async (ctx, next) => {
  logger.debug('deleteServer controller called');
  const serverCore = getServerCore();
  const workflowCore = getWorkflowCore();
  const blueprintCore = getBlueprintCore();
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;

  try {
    const server = await serverCore.getServer(id);

    if (!server) {
      ctx.status = 404;
      ctx.body = {
        message: 'Server not found',
      };
      return next();
    }

    if (server.is_syncing) {
      ctx.status = 400;
      ctx.body = {
        message: 'Server syncing, cannot be deleted right now',
      };
      return;
    }

    const workflows = await workflowCore.getWorkflowsByServer(id);
    if (workflows.length > 0) {
      const blueprintIds = workflows.map((workflow) => workflow.blueprint_id);
      const diagrams = await diagramCore.getDiagramsByBlueprintsBatch(
        blueprintIds
      );
      const diagramIds = diagrams.map((diagram) => diagram.id);

      await workflowCore.deleteWorkflowsByServer(id);
      await diagramCore.deleteDiagramsBatch(diagramIds);
      await blueprintCore.deleteBlueprintsBatch(blueprintIds);
    }

    await serverCore.deleteServer(id);

    ctx.status = 204;
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

module.exports = {
  saveServer,
  getAllServers,
  syncServer,
  deleteServer,
};
