const { db } = require('../utils/db');
const { v4: uuid } = require('uuid');
const { logger } = require('../utils/logger');
const _ = require('lodash');

class Diagram {

  static deserialize(serialized) {
    if(!serialized) { 
      return;
    }
    
    if (_.isArray(serialized)) {
      return serialized.map((data) => this._deserialized(data));
    } else {
      return this._deserialized(serialized);
    }
  }

  static _deserialized(data) {
    return {
      id: data.id,
      name: data.name,
      workflowId: data.workflow_id,
      userId: data.user_id,
      xml: data.diagram_xml,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  static serialize(diagram) {
    return {
      id: diagram.id,
      name: diagram.name,
      user_id: diagram.userId,
      diagram_xml: diagram.xml,
      workflow_id: diagram.workflowId
    }
  }

  constructor(name, user_id, diagram_xml, workflow_id = null, id = null) {
    this.id = id || uuid();
    this.name = name;
    this.userId = user_id;
    this.xml = diagram_xml;
    this.workflowId = workflow_id;
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

    return this.deserialize(diagrams);
  }

  static async getDiagramsByUserId(user_id) {
    logger.debug('getDiagramsByUserId service called');

    const diagrams = await db('diagrams')
      .select('id', 'name', 'user_id', 'workflow_id', 'created_at', 'updated_at')
      .where('user_id', user_id)
      .orderBy('updated_at', 'desc');

    return this.deserialize(diagrams);
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

    return this.deserialize(diagrams);
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
    
    return this.deserialize(diagrams);
  }

  static async updateDiagram(id, diagramObj) {
    logger.debug('updateDiagram service called');

    const diagram = this.serialize(diagramObj);

    const [ diagramUpdated ] = await db('diagrams')
      .where('id', id)
      .update({
        ...diagram,
        updated_at: 'now'
      })
      .returning('*');

    return this.deserialize(diagramUpdated);
  }

  static async deleteDiagram(id) {
    logger.debug('deleteDiagram service called');

    const diagram = await db('diagrams').where('id', id).first();

    if (diagram) {
      const [ diagramDeleted ] = await db('diagrams')
        .where('id', id).del().returning('*');

      return this.deserialize(diagramDeleted);
    }

    return;
  }
}

module.exports = Diagram;