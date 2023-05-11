require('dotenv').config();
const { logger } = require('../utils/logger');
const { buildXmlDiagram } = require('@flowbuild/nodejs-diagram-builder');
const {
  removeNodesByCategory,
  pinNodesByTypeAndCategory,
  orderBlueprintNodes,
} = require('../utils/workflowModifier');
const { getDiagramCore } = require('../diagramCore');

const buildDiagram = async (ctx, next) => {
  logger.debug('buildDiagram controller called');

  try {
    const { blueprint_spec, name, description } = ctx.request.body;
    const blueprint = {
      blueprint_spec,
      name: name || 'Diagram',
      description: description || 'Building Diagram',
    };
    blueprint.blueprint_spec.nodes = orderBlueprintNodes(blueprint_spec.nodes);

    const diagram = await buildXmlDiagram(blueprint);

    ctx.status = 200;
    ctx.body = diagram;
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const buildDiagramNoBags = async (ctx, next) => {
  logger.debug('buildDiagramNoBags controller called');

  try {
    let { blueprint_spec, name, description } = ctx.request.body;
    blueprint_spec = await removeNodesByCategory(blueprint_spec, 'settobag');

    const blueprint = {
      blueprint_spec,
      name: name || 'Diagram No Bags',
      description: description || 'Building Diagram With No Bags',
    };

    const diagram = await buildXmlDiagram(blueprint);

    ctx.status = 200;
    ctx.body = diagram;
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const buildDiagramUserTask = async (ctx, next) => {
  logger.debug('buildDiagramUserTask controller called');

  try {
    let { blueprint_spec, name, description } = ctx.request.body;
    const nodesToPin = [
      'start',
      'usertask',
      'flow',
      'finish',
      'timer',
      'event',
    ];
    blueprint_spec = await pinNodesByTypeAndCategory(
      blueprint_spec,
      nodesToPin
    );

    const blueprint = {
      blueprint_spec,
      name: name || 'Diagram UserTask',
      description: description || 'Building Diagram UserTask',
    };

    const diagram = await buildXmlDiagram(blueprint);

    ctx.status = 200;
    ctx.body = diagram;
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

const getDefaultDiagram = async (ctx, next) => {
  logger.debug('getDefaultDiagram controller called');
  const diagramCore = getDiagramCore();

  const { id: workflowId } = ctx.params;
  const user_id = ctx.request.user_data?.userId;

  try {
    const diagram = await diagramCore.getDefaultDiagram(user_id, {
      workflow_id: workflowId,
    });
    if (diagram) {
      ctx.status = 200;
      ctx.body = diagram.diagram_xml;
    } else {
      ctx.status = 404;
      ctx.body = {
        message: `No diagram to be returned`,
      };
    }
  } catch (err) {
    throw new Error(err);
  }

  return next();
};

module.exports = {
  buildDiagram,
  buildDiagramNoBags,
  buildDiagramUserTask,
  getDefaultDiagram,
};
