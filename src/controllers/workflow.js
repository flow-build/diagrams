require('dotenv').config();
const { logger } = require('../utils/logger');
const { buildXmlDiagram } = require('@flowbuild/nodejs-diagram-builder');
const { removeNodesByCategory } = require('../utils/workflowModifier');

const buildDiagram = async (ctx, next) => {
  logger.debug('buildDiagram controller called');

  try {
    const blueprint = ctx.request.body;
    blueprint.name = 'Diagram';
    blueprint.description = 'Building Diagram';

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
    let { blueprint_spec } = ctx.request.body;
    blueprint_spec = await removeNodesByCategory(blueprint_spec, 'settobag');
    
    const blueprint = {
      blueprint_spec,
      name: 'Diagram No Bags',
      description: 'Building Diagram With No Bags',
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
}