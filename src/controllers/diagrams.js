const diagramsService = require('../services/diagrams');

const saveDiagram = async (ctx, next) => {

  const { name, diagram_xml, workflow_id } = ctx.request.body;
  const { user_id } = ctx.state.user;

  const diagram = await diagramsService.saveDiagram(name, diagram_xml, workflow_id, user_id);
  
  ctx.status = 201;
  ctx.body = {
    id: diagram.id,
    name: diagram.name,
    workflow_id: diagram.workflow_id,
    user_id: diagram.user_id
  }

  return next();
}

const getAllDiagrams = async (ctx, next) => {

  const diagrams = await diagramsService.getAllDiagrams();

  ctx.status = 200;
  ctx.body = diagrams;

  return next();
}

const getAllDiagramsForUser = async (ctx, next) => {
  const { user_id } = ctx.state.user;

  const diagrams = await diagramsService.getAllDiagramsForUser(user_id);

  ctx.status = 200;
  ctx.body = diagrams;

  return next();
}

const getDiagramById = async (ctx, next) => {

  const { id } = ctx.params;
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

  return next();
}

const getDiagramsByWorkflowId = async(ctx, next) => {

  const { id } = ctx.params;
  const diagrams = await diagramsService.getDiagramsByWorkflowId(id);

  ctx.status = 200;
  ctx.body = diagrams;

  return next();
}

const updateDiagram = async (ctx, next) => {
  const { id } = ctx.params;
  const { name, diagram_xml } = ctx.request.body;
  const diagram = await diagramsService.updateDiagram(id, name, diagram_xml);

  if (diagram) {
    ctx.status = 200;
    ctx.body = {
      id: diagram.id,
      name: diagram.name,
      workflow_id: diagram.workflow_id,
      user_id: diagram.user_id
    }
  } else {
    ctx.status = 404;
    ctx.body = {
      message: 'Diagram not found'
    }
  }

  return next();
}

const deleteDiagram = async (ctx, next) => {
  const { id } = ctx.params;
  
  const diagramDeleted = await diagramsService.deleteDiagram(id);

  if (diagramDeleted) {
    ctx.status = 204;
  } else {
    ctx.status = 404;
    ctx.body = {
      message: 'Diagram not found'
    }
  }

  return next();
}

module.exports = {
  saveDiagram,
  getAllDiagrams,
  getAllDiagramsForUser,
  getDiagramById,
  getDiagramsByWorkflowId,
  updateDiagram,
  deleteDiagram
}