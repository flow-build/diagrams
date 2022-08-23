const { db } = require('../utils/db');
const { v4: uuid } = require('uuid');
const { logger } = require('../utils/logger');

const saveDiagram = async (diagram) => {
  logger.debug('saveDiagram service called');

  const { name, diagram_xml, workflow_id, user_id } = diagram;

  const [ diagramCreated ] = await db('diagrams')
    .insert({
      id: uuid(),
      name,
      diagram_xml,
      workflow_id,
      user_id
    }).returning('*');
  
  return diagramCreated;
}

const getAllDiagrams = async () => {
  logger.debug('getAllDiagrams service called');
  
  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id', 'created_at', 'updated_at');

  return diagrams;
}

const getDiagramsByUserId = async (user_id) => {
  logger.debug('getDiagramsByUserId service called');

  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id', 'created_at', 'updated_at')
    .where('user_id', user_id);

  return diagrams;
}

const getDiagramById = async (id) => {
  logger.debug('getDiagramById service called');

  const diagram = await db('diagrams').where('id', id).first();

  return diagram;
}

const getDiagramsByWorkflowId = async (workflow_id) => {
  logger.debug('getDiagramsByWorkflowId service called');

  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id', 'created_at', 'updated_at')
    .where('workflow_id', workflow_id);

  return diagrams;
}

const getLatestDiagramByWorkflowId = async (workflow_id) => {
  logger.debug('getLatestDiagramByWorkflowId service called');
  
  const diagram = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id', 'created_at', 'updated_at')
    .where('workflow_id', workflow_id)
    .orderBy('updated_at', 'desc')
    .first();
  
  return diagram;
}

const getDiagramsByUserAndWF = async (workflow_id, user_id) => {
  logger.debug('getDiagramsByUserAndWF service called');
  
  const diagrams = await db('diagrams')
    .select('id', 'name', 'workflow_id', 'user_id', 'created_at', 'updated_at')
    .where('workflow_id', workflow_id)
    .andWhere('user_id', user_id);
  
  return diagrams;
}

const updateDiagram = async (id, diagram) => {
  logger.debug('updateDiagram service called');

  const { name, diagram_xml } = diagram;

  const [ diagramUpdated ] = await db('diagrams')
    .where('id', id)
    .update({
      name,
      diagram_xml,
      updated_at: 'now'
    })
    .returning('*');

  return diagramUpdated;
}

const deleteDiagram = async (id) => {
  logger.debug('deleteDiagram service called');

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