const { db } = require('../utils/db');
const { v4: uuid } = require('uuid');
const { logger } = require('../utils/logger');

class Diagram {

  static serialize(diagram) {
    return {
      id: diagram.id,
      name: diagram.name,
      user_id: diagram.user_id,
      diagram_xml: diagram.diagram_xml,
      workflow_id: diagram.workflow_id
    }
  }

  static deserialize(serialized) {
    if (serialized) {
      const diagram = new Diagram(serialized.name, serialized.user_id, serialized.diagram_xml);
      diagram.id = serialized.id;
      diagram.workflow_id = serialized.workflow_id;
      diagram.created_at = serialized.created_at;
      diagram.updated_at = serialized.updated_at;

      return diagram;
    } else {
      return undefined;
    }
  }

  constructor(name, user_id, diagram_xml, workflow_id = null, id = null) {
    this.id = id || uuid();
    this.name = name;
    this.user_id = user_id;
    this.diagram_xml = diagram_xml;
    this.workflow_id = workflow_id;
  }

  static async saveDiagram(diagramObj) {
    logger.debug('saveDiagram service called');

    const { name, user_id, diagram_xml, workflow_id } = diagramObj;

    const diagram = new Diagram(name, user_id, diagram_xml, workflow_id);
    const diagramSerialized = this.serialize(diagram);

    const [ diagramCreated ] = await db('diagrams')
      .insert({
        ...diagramSerialized
      }).returning('*');
    
    return this.deserialize(diagramCreated);
  }

  static async getAllDiagrams() {
    logger.debug('getAllDiagrams service called');
  
    const diagrams = await db('diagrams')
      .select('*')
      .orderBy('updated_at', 'desc');

    return diagrams.map((diagram) => this.deserialize(diagram));
  }

  static async getDiagramsByUserId(user_id) {
    logger.debug('getDiagramsByUserId service called');

    const diagrams = await db('diagrams')
      .select('id', 'name', 'user_id', 'workflow_id', 'created_at', 'updated_at')
      .where('user_id', user_id)
      .orderBy('updated_at', 'desc');

    return diagrams.map((diagram) => this.deserialize(diagram));
  }

  static async getDiagramById(id) {
    logger.debug('getDiagramById service called');

    const diagram = await db('diagrams').where('id', id).first();

    return this.deserialize(diagram);
  }

  static async getDiagramsByWorkflowId(workflow_id) {
    logger.debug('getDiagramsByWorkflowId service called');

    const diagrams = await db('diagrams')
      .select('id', 'name', 'user_id', 'workflow_id', 'created_at', 'updated_at')
      .where('workflow_id', workflow_id)
      .orderBy('updated_at', 'desc');

    return diagrams.map((diagram) => this.deserialize(diagram));
  }

  static async getLatestDiagramByWorkflowId(workflow_id) {
    logger.debug('getLatestDiagramByWorkflowId service called');
  
    const diagram = await db('diagrams')
      .select('id', 'name', 'workflow_id', 'user_id', 'created_at', 'updated_at')
      .where('workflow_id', workflow_id)
      .orderBy('updated_at', 'desc')
      .first();
    
    return this.deserialize(diagram);
  }

  static async getDiagramsByUserAndWF(user_id, workflow_id) {
    logger.debug('getDiagramsByUserAndWF service called');
  
    const diagrams = await db('diagrams')
      .select('id', 'name', 'user_id', 'workflow_id', 'created_at', 'updated_at')
      .where('workflow_id', workflow_id)
      .andWhere('user_id', user_id);
    
    return diagrams.map((diagram) => this.deserialize(diagram));
  }

  static async updateDiagram(id, diagram) {
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

    return this.deserialize(diagramUpdated);
  }

  static async deleteDiagram(id) {
    logger.debug('deleteDiagram service called');

    const diagram = await db('diagrams').where('id', id).first();

    if (diagram) {
      const diagramDeleted = await db('diagrams')
        .where('id', id).del().returning('*');

      return this.deserialize(diagramDeleted);
    }

    return;
  }
}

module.exports = Diagram;