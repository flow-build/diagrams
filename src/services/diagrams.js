const { db } = require('../utils/db');
const { v4: uuid, validate } = require('uuid');

const saveDiagram = async (name, diagram_xml, workflow_id, user_id) => {

  if (!user_id) {
    throw new Error('Missing user_id or actor_id', 400);
  }

  if (!name) {
    throw new Error('Missing name', 400);
  }

  if(!diagram_xml) {
    throw new Error('Missing diagram_xml', 400)
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
  const diagrams = await db('diagrams').select('id', 'name', 'workflow_id', 'user_id');

  return diagrams;
}

const getDiagramById = async (id) => {

  if (!validate(id)) {
    throw new Error('Invalid id', 400);
  }

  const diagram = await db('diagrams').where('id', id).first();

  if(!diagram) {
    return;
  }

  return diagram;
}

module.exports = {
  saveDiagram,
  getAllDiagrams,
  getDiagramById
}