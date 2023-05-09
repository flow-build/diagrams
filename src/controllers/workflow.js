require('dotenv').config();
const { logger } = require('../utils/logger');
const { buildXmlDiagram } = require('@flowbuild/nodejs-diagram-builder');
const { removeNodesByCategory, pinNodesByTypeAndCategory } = require('../utils/workflowModifier');

const buildDiagram = async (ctx, next) => {
  logger.debug('buildDiagram controller called');

  try {
    const { blueprint_spec, name, description } = ctx.request.body;
    const blueprint = {
      blueprint_spec,
      name: name || 'Diagram',
      description: description || 'Building Diagram',
    }

    const diagram = await buildXmlDiagram(blueprint);

    ctx.status = 200;
    ctx.body = diagram;
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const buildDiagramNoBags = async (ctx, next) => {
  logger.debug('buildDiagramNoBags controller called');

  try {
    let { blueprint_spec, name, description } = ctx.request.body;
    blueprint_spec = await removeNodesByCategory(blueprint_spec, 'settobag');
    
    const blueprint = {
      blueprint_spec,
      name: name || 'Diagram No Bags',
      description: description || 'Building Diagram With No Bags',
    }

    const diagram = await buildXmlDiagram(blueprint);

    ctx.status = 200;
    ctx.body = diagram;
  } catch(err) {
    throw new Error(err);
  }

  return next();
}

const buildDiagramUserTask = async (ctx, next) => {
  logger.debug('buildDiagramUserTask controller called');

  try {
    let { blueprint_spec, name, description } = ctx.request.body;
    const nodesToPin = ['start', 'usertask', 'flow', 'finish', 'timer', 'event'];
    blueprint_spec = await pinNodesByTypeAndCategory(blueprint_spec, nodesToPin);
    
    const blueprint = {
      blueprint_spec,
      name: name || 'Diagram UserTask',
      description: description || 'Building Diagram UserTask',
    }

    const diagram = await buildXmlDiagram(blueprint);

    ctx.status = 200;
    ctx.body = diagram;
  } catch(err) {
    throw new Error(err);
  }

  return next(); 
}

module.exports = {
  buildDiagram,
  buildDiagramNoBags,
  buildDiagramUserTask,
}