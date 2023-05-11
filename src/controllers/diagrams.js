require('dotenv').config();
const emitter = require('../utils/eventEmitter');
const { logger } = require('../utils/logger');
const {
  getDiagramCore,
  getBlueprintCore,
  getDiagramToWorkflowCore,
} = require('../diagramCore');
const { checkAlignment } = require('../utils/alignment');

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
    if (diagram.is_public) {
      return false;
    }
  }
  if (diagram.user_id !== user_id) {
    return true;
  }
  return false;
};

const forbiddenResponse = (ctx, _next) => {
  ctx.status = 403;
  ctx.body = {
    message: 'FORBIDDEN',
  };
  return;
};

const filterDiagrams = (user_id, diagrams) => {
  return diagrams.filter((diagram) => {
    const isForbid = forbidDiagramForUser(user_id, diagram);
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

    const diagram = await diagramCore.saveDiagram({
      diagram_xml,
      name,
      user_id,
      user_default,
      type,
      isPublic,
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
    const filteredDiagrams = filterDiagrams(user_id, diagrams);
    ctx.status = 200;
    ctx.body = filteredDiagrams.map((diagram) =>
      serializeDiagramNoXml(diagram)
    );
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const getDiagramsByUserId = async (ctx, next) => {
  logger.debug('getDiagramsByUserId controller called');
  const diagramCore = getDiagramCore();

  const user_id = ctx.params.id;

  try {
    const diagrams = await diagramCore.getDiagramsByUserId(user_id);

    if (diagrams.length > 0) {
      ctx.status = 200;
      ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram));
    } else {
      ctx.status = 404;
      ctx.body = {
        message: `No diagram with user_id: ${user_id}`,
      };
    }
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const getDiagramsByUserAndWF = async (ctx, next) => {
  logger.debug('getDiagramsByUserAndWF controller called');
  const diagramCore = getDiagramCore();

  const { user_id, workflow_id } = ctx.params;

  try {
    const diagrams = await diagramCore.getDiagramsByUserAndWF(
      user_id,
      workflow_id
    );

    if (diagrams.length > 0) {
      ctx.status = 200;
      ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram));
    } else {
      ctx.status = 404;
      ctx.body = {
        message: `No diagram with workflow_id: ${workflow_id} and user_id: ${user_id}`,
      };
    }
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
    const is_forbidden = forbidDiagramForUser(user_id, diagram, 'read');
    if (is_forbidden) {
      return forbiddenResponse(ctx, next);
    }

    if (diagram) {
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

const getDiagramsByWorkflowId = async (ctx, next) => {
  logger.debug('getDiagramsByWorkflowId controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;
  const user_id = ctx.request.user_data?.userId;

  try {
    const diagrams = await diagramCore.getDiagramsByWorkflowId(id);
    const filteredDiagrams = filterDiagrams(user_id, diagrams);
    if (filteredDiagrams.length > 0) {
      ctx.status = 200;
      ctx.body = filteredDiagrams.map((diagram) =>
        serializeDiagramNoXml(diagram)
      );
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
  const blueprintCore = getBlueprintCore();

  const { id } = ctx.params;
  const { xml: diagram_xml } = ctx.request.body;
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
    let aligned;

    if (diagram.blueprint_id && diagram_xml) {
      const { blueprint_spec } = await blueprintCore.getBlueprintById(
        diagram.blueprint_id
      );
      if (blueprint_spec?.nodes) {
        const blueprint = {
          name: 'Check_Alignment',
          description: 'Check alignmen',
          blueprint_spec,
        };
        aligned = await checkAlignment(blueprint, diagram_xml);
      }
    }
    const diagramUpdated = await diagramCore.updateDiagram(id, {
      ...ctx.request.body,
      aligned,
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
    const diagram = await diagramCore.setAsDefault(id);
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
    ctx.status = 200;
    ctx.body = serializeDiagramNoXml(diagram);
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const deleteDiagram = async (ctx, next) => {
  logger.debug('deleteDiagram controller called');
  const diagramCore = getDiagramCore();
  const diagramToWorkflowCore = getDiagramToWorkflowCore();

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

    const workflowsByDiagramId =
      await diagramToWorkflowCore.getWorkflowIdsByDiagramId(id);

    if (workflowsByDiagramId.length > 0) {
      await diagramToWorkflowCore.deleteByDiagramId(id);
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
  getDiagramsByUserId,
  getDiagramsByUserAndWF,
  getDiagramById,
  getDiagramsByWorkflowId,
  getLatestDiagramByWorkflowId,
  updateDiagram,
  deleteDiagram,
  setDefaultDiagram,
  serializeDiagramNoXml,
};
