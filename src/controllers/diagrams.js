const Diagram = require('../services/diagrams');
const { logger } = require('../utils/logger');

const serializeDiagramXml = (diagram) => {
  return diagram.diagram_xml;
}

const serializeDiagramNoXml = (diagram) => {
  return {
    id: diagram.id,
    name: diagram.name,
    user_id: diagram.user_id,
    workflow_id: diagram.workflow_id,
    created_at: diagram.created_at,
    updated_at: diagram.updated_at
  }
}

const saveDiagram = async (ctx, next) => {
  logger.debug('saveDiagram controller called');

  try {
    const diagram = await Diagram.saveDiagram(ctx.request.body);
  
    ctx.status = 201;
    ctx.body = serializeDiagramNoXml(diagram);
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getAllDiagrams = async (ctx, next) => {
  logger.debug('getAllDiagrams controller called');

  try {
    const diagrams = await Diagram.getAllDiagrams();
    ctx.status = 200;
    ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram));  
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramsByUserId = async (ctx, next) => {
  logger.debug('getDiagramsByUserId controller called');

  const user_id = ctx.params.id;

  try {
    const diagrams = await Diagram.getDiagramsByUserId(user_id);
    ctx.status = 200;
    ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram)); 
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramsByUserAndWF = async (ctx, next) => {
  logger.debug('getDiagramsByUserAndWF controller called');

  const { workflow_id, user_id } = ctx.params;

  try {
    const diagrams = await Diagram.getDiagramsByUserAndWF(user_id, workflow_id);
    ctx.status = 200;
    ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram)); 
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramById = async (ctx, next) => {
  logger.debug('getDiagramById controller called');

  const { id } = ctx.params;

  try {
    const diagram = await Diagram.getDiagramById(id);
  
    if (diagram) {
      ctx.status = 200;
      ctx.body = serializeDiagramXml(diagram);
    } else {
      ctx.status = 404;
      ctx.body = {
        message: 'Diagram not found'
      }
    }
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramsByWorkflowId = async(ctx, next) => {
  logger.debug('getDiagramsByWorkflowId controller called');

  const { id } = ctx.params;

  try {
    const diagrams = await Diagram.getDiagramsByWorkflowId(id);

    ctx.status = 200;
    ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram));
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getLatestDiagramByWorkflowId = async (ctx, next) => {
  logger.debug('getLatestDiagramByWorkflowId controller called');

  const { id } = ctx.params;

  try {
    const diagram = await Diagram.getLatestDiagramByWorkflowId(id);

    ctx.status = 200;
    ctx.body = serializeDiagramNoXml(diagram);
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const updateDiagram = async (ctx, next) => {
  logger.debug('updateDiagram controller called');

  const { id } = ctx.params;

  try {
    const diagram = await Diagram.getDiagramById(id);

    if (!diagram) {
      ctx.status = 404;
      ctx.body = {
        message: 'Diagram not found'
      }
      return;
    }
    const diagramUpdated = await Diagram.updateDiagram(id, ctx.request.body);
    ctx.status = 200;
    ctx.body = serializeDiagramNoXml(diagramUpdated)
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const deleteDiagram = async (ctx, next) => {
  logger.debug('deleteDiagram controller called');

  const { id } = ctx.params;

  try {
    const diagramDeleted = await Diagram.deleteDiagram(id);

    if (diagramDeleted) {
      ctx.status = 204;
    } else {
      ctx.status = 404;
      ctx.body = {
        message: 'Diagram not found'
      }
    }  
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

module.exports = {
  saveDiagram,
  getAllDiagrams,
  getDiagramsByUserId,
  getDiagramsByUserAndWF,
  getDiagramById,
  getDiagramsByWorkflowId,
  getLatestDiagramByWorkflowId,
  updateDiagram,
  deleteDiagram
}