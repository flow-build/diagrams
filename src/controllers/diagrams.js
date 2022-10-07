const { logger } = require('../utils/logger');
const { getDiagramCore } = require('../diagramCore');
const { checkAlignment } = require('../utils/alignment');
const { getWorkflowFromFlowbuild } = require('../services/getFlowbuildBlueprint');

const serializeDiagramXml = (diagram) => {
  return diagram.diagram_xml;
}

const serializeDiagramNoXml = (diagram) => {
  return {
    id: diagram.id,
    name: diagram.name,
    user_id: diagram.user_id,
    workflow_id: diagram.workflow_id,
    aligned: diagram.aligned,
    created_at: diagram.created_at,
    updated_at: diagram.updated_at
  }
}

const saveDiagram = async (ctx, next) => {
  logger.debug('saveDiagram controller called');
  const diagramCore = getDiagramCore();

  try {
    const { workflow_id, diagram_xml } = ctx.request.body;
    let aligned = null;

    if (workflow_id) {
      const { blueprint, error } = await getWorkflowFromFlowbuild(workflow_id);

      if (error) {
        ctx.status = 502;
        ctx.body = {
          message: 'Flowbuild server unavailable'
        }
      } else if (!!blueprint) {
        aligned = await checkAlignment(blueprint, diagram_xml);
      }
    } 
    const diagram = await diagramCore.saveDiagram({ ...ctx.request.body, aligned });
    
    ctx.status = 201;
    ctx.body = serializeDiagramNoXml(diagram);
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getAllDiagrams = async (ctx, next) => {
  logger.debug('getAllDiagrams controller called');
  const diagramCore = getDiagramCore();

  try {
    const diagrams = await diagramCore.getAllDiagrams();
    ctx.status = 200;
    ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram));  
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramsByUserId = async (ctx, next) => {
  logger.debug('getDiagramsByUserId controller called');
  const diagramCore = getDiagramCore();

  const user_id = ctx.params.id;

  try {
    const diagrams = await diagramCore.getDiagramsByUserId(user_id);
    ctx.status = 200;
    ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram)); 
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramsByUserAndWF = async (ctx, next) => {
  logger.debug('getDiagramsByUserAndWF controller called');
  const diagramCore = getDiagramCore();

  const { user_id, workflow_id } = ctx.params;

  try {
    const diagrams = await diagramCore.getDiagramsByUserAndWF(user_id, workflow_id);
    ctx.status = 200;
    ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram)); 
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const getDiagramById = async (ctx, next) => {
  logger.debug('getDiagramById controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;

  try {
    const diagram = await diagramCore.getDiagramById(id);
  
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
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;

  try {
    const diagrams = await diagramCore.getDiagramsByWorkflowId(id);

    ctx.status = 200;
    ctx.body = diagrams.map((diagram) => serializeDiagramNoXml(diagram));
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getLatestDiagramByWorkflowId = async (ctx, next) => {
  logger.debug('getLatestDiagramByWorkflowId controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;

  try {
    const diagram = await diagramCore.getLatestDiagramByWorkflowId(id);

    ctx.status = 200;
    ctx.body = serializeDiagramNoXml(diagram);
  } catch (err) {
    throw new Error(err);
  }

  return next();
}

const updateDiagram = async (ctx, next) => {
  logger.debug('updateDiagram controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;
  const { diagram_xml } = ctx.request.body;
  
  try {
    const diagram = await diagramCore.getDiagramById(id);

    if (!diagram) {
      ctx.status = 404;
      ctx.body = {
        message: 'Diagram not found'
      }
      return;
    }
    let aligned;

    if (diagram.workflow_id && diagram_xml) {
      const { blueprint, error } = await getWorkflowFromFlowbuild(diagram.workflow_id);

      if (error) {
        ctx.status = 502;
        ctx.body = {
          message: 'Flowbuild server unavailable'
        }
      } else if (!!blueprint) {
        aligned = await checkAlignment(blueprint, diagram_xml);
      }
    } 
    const diagramUpdated = await diagramCore.updateDiagram(id, {...ctx.request.body, aligned});
    ctx.status = 200;
    ctx.body = serializeDiagramNoXml(diagramUpdated)
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const deleteDiagram = async (ctx, next) => {
  logger.debug('deleteDiagram controller called');
  const diagramCore = getDiagramCore();

  const { id } = ctx.params;

  try {
    const diagramDeleted = await diagramCore.deleteDiagram(id);

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