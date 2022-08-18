const diagramsService = require('../services/diagrams');
const { validate } = require('uuid');
const parseString = require('xml2js').parseString;

const saveDiagram = async (ctx, next) => {

  const { name, diagram_xml, workflow_id, user_id } = ctx.request.body;

  if (!user_id) {
    ctx.throw(400, 'Missing user_id');
  }

  if (!name) {
    ctx.throw(400, 'Missing name');
  }

  if (workflow_id && !validate(workflow_id)) {
    ctx.throw(400, 'Invalid workflow_id');
  }

  if (!diagram_xml) {
    ctx.throw(400, 'Missing diagram_xml');
  }

  await parseString(diagram_xml, function (err) {
    if (err) {
      ctx.throw(400, 'Invalid xml');
    }
  });


  try {
    const diagram = await diagramsService.saveDiagram(name, diagram_xml, workflow_id, user_id);
  
    ctx.status = 201;
    ctx.body = {
      id: diagram.id,
      name: diagram.name,
      workflow_id: diagram.workflow_id,
      user_id: diagram.user_id
    }
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const getAllDiagrams = async (ctx, next) => {

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
  const { workflow_id, user_id } = ctx.params;

  if (!validate(workflow_id)) {
    ctx.throw(400, 'Invalid workflow_id');
  }

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

  const { id } = ctx.params;

  if (!validate(id)) {
    ctx.throw(400, 'Invalid id');
  }

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

  const { id } = ctx.params;

  if (!validate(id)) {
    ctx.throw(400, 'Invalid workflow_id');
  }

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
  const { id } = ctx.params;

  if (!validate(id)) {
    ctx.throw(400, 'Invalid workflow_id');
  }

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
  const { id } = ctx.params;
  const { name, diagram_xml } = ctx.request.body;

  if (!validate(id)) {
    ctx.throw(400, 'Invalid id');
  }

  if (!name && !diagram_xml) {
    ctx.throw(400, 'Missing name or diagram_xml');
  }

  await parseString(diagram_xml, function (err) {
    if (err) {
      ctx.throw(400, 'Invalid xml');
    }
  });

  try {
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
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const deleteDiagram = async (ctx, next) => {
  const { id } = ctx.params;
  
  if (!validate(id)) {
    ctx.throw(400, 'Invalid id');
  }

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