const { validateBody } = require('./base');

const validateSaveDiagram = validateBody({
  type: 'object',
  required: ['name', 'xml'],
  properties: {
    name: { type: 'string' },
    isDefault: {
      type: ['boolean', 'string'],
      enum: [true, false, 'true', 'false'],
    },
    isPublic: {
      type: ['boolean', 'string'],
      enum: [true, false, 'true', 'false'],
    },
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
});

const validateUpdateDiagram = validateBody({
  type: 'object',
  properties: {
    name: { type: 'string' },
    isPublic: {
      type: ['boolean', 'string'],
      enum: [true, false, 'true', 'false'],
    },
    isDefault: {
      type: ['boolean', 'string'],
      enum: [true, false, 'true', 'false'],
    },
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
});

module.exports = {
  validateSaveDiagram,
  validateUpdateDiagram,
};
