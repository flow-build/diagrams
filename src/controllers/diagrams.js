const diagramsService = require('../services/diagrams');

const saveDiagram = async (ctx, next) => {

  const { name, diagram_xml, workflow_id, user_id } = ctx.request.body;
  const { actor_id } = ctx.state.user;
  const user = actor_id || user_id;

  const diagram = await diagramsService.saveDiagram(name, diagram_xml, workflow_id, user);
  
  ctx.status = 201;
  ctx.body = {
    id: diagram.id,
    name: diagram.name,
    workflow_id: diagram.workflow_id,
    user_id: diagram.user_id
  }

  return next();
}

const getAllDiagrams = async (ctx, next) =>{
  const diagrams = await diagramsService.getAllDiagrams();

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

module.exports = {
  saveDiagram,
  getAllDiagrams,
  getDiagramById
}