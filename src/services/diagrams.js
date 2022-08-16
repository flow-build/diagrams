const { db } = require('../utils/db');
const { v4: uuid, validate } = require('uuid');

const saveDiagram = async (name, diagram_xml, workflow_id, user_id) => {

  if (!user_id) {
    throw new Error('Missing user_id');
  }

  if (!name) {
    throw new Error('Missing name');
  }

  if(!diagram_xml) {
    throw new Error('Missing diagram_xml')
  }

  const diagram = await db('diagrams')
    .insert({
      id: uuid(),
      name,
      diagram_xml,
      workflow_id,
      user_id
    }).returning('*');
  
  return diagram[0];
}

const getAllDiagrams = async () => {
  
  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id');

  return diagrams;
}

const getAllDiagramsForUser = async (user_id) => {

  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id')
    .where('user_id', user_id);

  return diagrams;
}

const getDiagramById = async (id) => {

  if (!validate(id)) {
    throw new Error('Invalid id');
  }

  const diagram = await db('diagrams').where('id', id).first();

  if(!diagram) {
    return;
  }

  return diagram;
}

const getDiagramsByWorkflowId = async(workflow_id) => {

  if (!validate(workflow_id)) {
    throw new Error('Invalid id');
  }

  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id')
    .where('workflow_id', workflow_id);

  return diagrams;
}

module.exports = {
  saveDiagram,
  getAllDiagrams,
  getAllDiagramsForUser,
  getDiagramById,
  getDiagramsByWorkflowId
}