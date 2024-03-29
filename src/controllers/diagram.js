require('dotenv').config();
const emitter = require('../utils/eventEmitter');
const { logger } = require('../utils/logger');
const { getDiagramCore, getWorkflowCore } = require('../diagramCore');

const serializeDiagramXml = (diagram) => {
  return diagram.diagram_xml;
};

const serializeDiagramNoXml = (diagram) => {
  return {
    id: diagram.id,
    name: diagram.name,
    type: diagram.type,
    userId: diagram.user_id,
    isDefault: diagram.user_default,
    isPublic: diagram.is_public,
    workflowId: diagram.workflow_id,
    aligned: diagram.aligned,
    createdAt: diagram.created_at,
    updatedAt: diagram.updated_at,
  };
};

const forbidDiagramForUser = (user_id, diagram, operation = 'update') => {
  if (operation === 'read') {
    if (diagram?.is_public) {
      return false;
    }
  }
  return diagram?.user_id !== user_id;
};

const forbiddenResponse = (ctx, _next) => {
  ctx.status = 403;
  ctx.body = {
    message: 'FORBIDDEN',
  };
  return ctx;
};

const filterDiagrams = (user_id, diagrams, operation) => {
  return diagrams.filter((diagram) => {
    const isForbid = forbidDiagramForUser(user_id, diagram, operation);
    return !isForbid;
  });
};

const saveDiagram = async (ctx, next) => {
  logger.debug('saveDiagram controller called');
  const diagramCore = getDiagramCore();
  const user_id = ctx.request.user_data?.userId;

  try {
    const {
      xml: diagram_xml,
      name,
      isDefault: user_default,
      isPublic,
      workflowId: workflow_id,
      type,
    } = ctx.request.body;

    let blueprint_id;
    if (workflow_id) {
      const workflowCore = getWorkflowCore();
      const workflow = await workflowCore.getWorkflowById(workflow_id);
      if (!workflow) {
        ctx.status = 404;
        ctx.body = {
          message: 'Workflow not found',
        };
        return;
      }
      blueprint_id = workflow.blueprint_id;
    }

    const diagram = await diagramCore.saveDiagram({
      diagram_xml,
      name,
      user_id,
      user_default,
      type,
      isPublic,
      blueprint_id,
    });

    if (workflow_id) {
      logger.info(`Check Alignment event called - Diagram_id: ${diagram.id}`);
      emitter.emit('Check Alignment', {
        ...ctx.request.body,
        diagram_id: diagram.id,
      });

      ctx.status = 202;
      ctx.body = {
        message: 'Diagram Created. Alignment Queued',
        diagram: {
          ...serializeDiagramNoXml({ ...diagram, workflow_id }),
        },
      };
      return next();
    }

    ctx.status = 201;
    ctx.body = serializeDiagramNoXml(diagram);
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const getAllDiagrams = async (ctx, next) => {
  logger.debug('getAllDiagrams controller called');
  const diagramCore = getDiagramCore();
  const user_id = ctx.request.user_data?.userId;

  try {
    const diagrams = await diagramCore.getAllDiagrams();
    const filteredDiagrams = filterDiagrams(user_id, diagrams, 'read');
    ctx.status = 200;
    ctx.body = filteredDiagrams.map((diagram) =>
      serializeDiagramNoXml(diagram)
    );
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const getDiagramById = async (ctx, next) => {
  logger.debug('getDiagramById controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;
  const user_id = ctx.request.user_data?.userId;

  try {
    const diagram = await diagramCore.getDiagramById(id);

    if (diagram) {
      const is_forbidden = forbidDiagramForUser(user_id, diagram, 'read');
      if (is_forbidden) {
        return forbiddenResponse(ctx, next);
      }
      ctx.status = 200;
      ctx.body = serializeDiagramXml(diagram);
    } else {
      ctx.status = 404;
      ctx.body = {
        message: 'Diagram not found',
      };
    }
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const getLatestDiagramByWorkflowId = async (ctx, next) => {
  logger.debug('getLatestDiagramByWorkflowId controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;

  try {
    const diagram = await diagramCore.getLatestDiagramByWorkflowId(id);

    if (diagram) {
      ctx.status = 200;
      ctx.body = serializeDiagramNoXml(diagram);
    } else {
      ctx.status = 404;
      ctx.body = {
        message: `No diagram with workflow_id: ${id}`,
      };
    }
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const updateDiagram = async (ctx, next) => {
  logger.debug('updateDiagram controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;
  const {
    xml: diagram_xml,
    name,
    isPublic: is_public,
    isDefault,
  } = ctx.request.body;
  const user_id = ctx.request.user_data?.userId;

  try {
    const diagram = await diagramCore.getDiagramById(id);
    const is_forbidden = forbidDiagramForUser(user_id, diagram);
    if (is_forbidden) {
      return forbiddenResponse(ctx, next);
    }

    if (!diagram) {
      ctx.status = 404;
      ctx.body = {
        message: 'Diagram not found',
      };
      return;
    }

    if (isDefault && diagram.user_id && diagram.blueprint_id) {
      await diagramCore.setAsDefault(id);
    }

    const diagramUpdated = await diagramCore.updateDiagram(id, {
      diagram_xml,
      name,
      is_public,
    });
    ctx.status = 200;
    ctx.body = serializeDiagramNoXml(diagramUpdated);
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const setDefaultDiagram = async (ctx, next) => {
  logger.debug('setDefaultDiagram controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;
  const user_id = ctx.request.user_data?.userId;

  try {
    const diagram = await diagramCore.getDiagramById(id);
    const is_forbidden = forbidDiagramForUser(user_id, diagram);
    if (is_forbidden) {
      return forbiddenResponse(ctx, next);
    }

    if (!diagram) {
      ctx.status = 404;
      ctx.body = {
        message: 'Diagram not found',
      };
      return;
    }

    if (!diagram.user_id) {
      ctx.status = 400;
      ctx.body = {
        message: 'Cannot set diagram without user_id as default',
      };
      return;
    }

    if (!diagram.blueprint_id) {
      ctx.status = 400;
      ctx.body = {
        message: 'Cannot set diagram without workflow as default',
      };
      return;
    }

    const diagramDefault = await diagramCore.setAsDefault(id);

    ctx.status = 200;
    ctx.body = serializeDiagramNoXml(diagramDefault);
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const deleteDiagram = async (ctx, next) => {
  logger.debug('deleteDiagram controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;
  const user_id = ctx.request.user_data?.userId;

  try {
    const diagram = await diagramCore.getDiagramById(id);

    const is_forbidden = forbidDiagramForUser(user_id, diagram);
    if (is_forbidden) {
      return forbiddenResponse(ctx, next);
    }
    if (!diagram) {
      ctx.status = 404;
      ctx.body = {
        message: 'Diagram not found',
      };
      return next();
    }

    await diagramCore.deleteDiagram(id);

    ctx.status = 204;
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

module.exports = {
  saveDiagram,
  getAllDiagrams,
  getDiagramById,
  getLatestDiagramByWorkflowId,
  updateDiagram,
  deleteDiagram,
  setDefaultDiagram,
  serializeDiagramNoXml,
};
