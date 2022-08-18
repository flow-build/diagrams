const { db } = require('../utils/db');
const { v4: uuid } = require('uuid');

const saveDiagram = async (name, diagram_xml, workflow_id, user_id) => {

  const [ diagram ] = await db('diagrams')
    .insert({
      id: uuid(),
      name,
      diagram_xml,
      workflow_id,
      user_id
    }).returning('*');
  
  return diagram;
}

const getAllDiagrams = async () => {
  
  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id');

  return diagrams;
}

const getDiagramsByUserId = async (user_id) => {

  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id')
    .where('user_id', user_id);

  return diagrams;
}

const getDiagramById = async (id) => {

  const diagram = await db('diagrams').where('id', id).first();

  return diagram;
}

const getDiagramsByWorkflowId = async (workflow_id) => {

  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id')
    .where('workflow_id', workflow_id);

  return diagrams;
}

const getLatestDiagramByWorkflowId = async (workflow_id) => {
  
  const diagram = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id')
    .where('workflow_id', workflow_id)
    .orderBy('updated_at', 'desc')
    .first();
  
  return diagram;
}

const getDiagramsByUserAndWF = async (workflow_id, user_id) => {
  
  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id')
    .where('workflow_id', workflow_id)
    .andWhere('user_id', user_id);
  
  return diagrams;
}

const updateDiagram = async (id, name, diagram_xml) => {

  const diagram = await db('diagrams').where('id', id).first();

  if (diagram) {

    const [ diagramUpdated ] = await db('diagrams')
      .where('id', id)
      .update({
        name,
        diagram_xml
      })
      .returning('*');

    return diagramUpdated;
  } 

  return;
}

const deleteDiagram = async (id) => {

  const diagram = await db('diagrams').where('id', id).first();

  if (diagram) {
    const diagramDeleted = await db('diagrams')
      .where('id', id).del().returning('*');

    return diagramDeleted;
  } 

  return;
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