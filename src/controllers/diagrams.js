const diagramsService = require('../services/diagrams');
const { logger } = require('../utils/logger');

const saveDiagram = async (ctx, next) => {
  logger.debug('saveDiagram controller called');

  const { name, diagram_xml, workflow_id, user_id } = ctx.request.body;

  try {
    const diagram = await diagramsService.saveDiagram(name, diagram_xml, workflow_id, user_id);
  
    ctx.status = 201;
    ctx.body = {
      id: diagram.id,
      name: diagram.name,
      workflow_id: diagram.workflow_id,
      user_id: diagram.user_id,
      created_at: diagram.created_at,
      updated_at: diagram.updated_at
    }
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getAllDiagrams = async (ctx, next) => {
  logger.debug('getAllDiagrams controller called');

  try {
    const diagrams = await diagramsService.getAllDiagrams();
    ctx.status = 200;
    ctx.body = diagrams;  
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramsByUserId = async (ctx, next) => {
  logger.debug('getDiagramsByUserId controller called');

  const user_id = ctx.params.id;

  try {
    const diagrams = await diagramsService.getDiagramsByUserId(user_id);
    ctx.status = 200;
    ctx.body = diagrams;
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramsByUserAndWF = async (ctx, next) => {
  logger.debug('getDiagramsByUserAndWF controller called');

  const { workflow_id, user_id } = ctx.params;

  try {
    const diagrams = await diagramsService.getDiagramsByUserAndWF(workflow_id, user_id);
    ctx.status = 200;
    ctx.body = diagrams;
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramById = async (ctx, next) => {
  logger.debug('getDiagramById controller called');

  const { id } = ctx.params;

  try {
    const diagram = await diagramsService.getDiagramById(id);
  
    if (diagram) {
      ctx.status = 200;
      ctx.body = diagram.diagram_xml;
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
    const diagrams = await diagramsService.getDiagramsByWorkflowId(id);

    ctx.status = 200;
    ctx.body = diagrams;  
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getLatestDiagramByWorkflowId = async (ctx, next) => {
  logger.debug('getLatestDiagramByWorkflowId controller called');

  const { id } = ctx.params;

  try {
    const diagram = await diagramsService.getLatestDiagramByWorkflowId(id);

    ctx.status = 200;
    ctx.body = diagram;
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const updateDiagram = async (ctx, next) => {
  logger.debug('updateDiagram controller called');

  const { id } = ctx.params;
  const { name, diagram_xml } = ctx.request.body;

  try {
    const diagram = await diagramsService.updateDiagram(id, name, diagram_xml);
    
    if (diagram) {
      ctx.status = 200;
      ctx.body = {
        id: diagram.id,
        name: diagram.name,
        workflow_id: diagram.workflow_id,
        user_id: diagram.user_id,
        created_at: diagram.created_at,
        updated_at: diagram.updated_at
      }
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

const deleteDiagram = async (ctx, next) => {
  logger.debug('deleteDiagram controller called');

  const { id } = ctx.params;

  try {
    const diagramDeleted = await diagramsService.deleteDiagram(id);

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