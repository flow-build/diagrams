const { validateBody } = require('./base');

const validateSaveDiagram = validateBody({
  type: 'object',
  required: ['name', 'xml'],
  properties: {
    name: { type: 'string' },
    isDefault: { type: 'boolean' },
    isPublic: { type: 'boolean' },
    workflowId: { type: 'string', format: 'uuid' },
    xml: {
      type: 'string',
      allOf: [
        {
          transform: ['trim'],
        },
        {
          minLength: 21,
        },
      ],
    },
  },
  additionalProperties: false,
});

const validateUpdateDiagram = validateBody({
  type: 'object',
  properties: {
    name: { type: 'string' },
    xml: {
      type: 'string',
      allOf: [
        {
          transform: ['trim'],
        },
        {
          minLength: 21,
        },
      ],
    },
  },
  anyRequired: ['name', 'xml'],
  additionalProperties: false,
});

module.exports = {
  validateSaveDiagram,
  validateUpdateDiagram,
};
