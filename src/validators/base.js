const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const addKeywords = require('ajv-keywords');
const { logger } = require('../utils/logger');
const { validate } = require('uuid');
const parseString = require('xml2js').parseString;

const validateBody = (schema) => {
  return async (ctx, next) => {
    logger.debug('validateBody called');

    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    addKeywords(ajv);

    const is_valid = await ajv.validate(schema, ctx.request.body);

    if (!is_valid) {
      logger.debug(`Invalid request body: ${ajv.errors.length} error(s)`);
      
      ctx.throw(400, {
        message: 'Invalid Request Body',
        errors: ajv.errors.map((err) => {
          const response = {
            field: err.instancePath, 
            message: err.message
          }
          return response;
        })
      });

      return next();
    }

    const { diagram_xml } = ctx.request.body;

    if (diagram_xml) {
      await parseString(diagram_xml, function (err) {
        if (err) {
          ctx.throw(400, 'Invalid xml');
        }
      });
    }

    return await next();
  }
};

const validateUUID = async (ctx, next) => {
  logger.debug('validateUUID called');

  const id = ctx.params.id || ctx.params.workflow_id;

  if (id) {
    const is_valid = validate(id);
    if (!is_valid) {
      ctx.throw(400, 'Invalid uuid');

      return next();
    } else {
      return await next();
    }
  } else {
    return await next();
  }
};

module.exports = {
  validateBody,
  validateUUID
}
