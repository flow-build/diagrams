const { validateBody } = require('./base');

const validateSaveDiagram = validateBody({
  type: 'object',
  required: ['name', 'user_id', 'diagram_xml'],
  properties: {
    name: { type: 'string' },
    user_id: { type: 'string' },
    workflow_id: { type: 'string', format: 'uuid' },
    diagram_xml: { 
      type: 'string',
      allOf: [
        {
          'transform': [
            'trim'
          ]
        },
        {
          'minLength': 21
        }
      ]
    }
  },
  additionalProperties: false
});

const validateUpdateDiagram = validateBody({
  type: 'object',
  properties: {
    name: { type: 'string' },
    diagram_xml: { 
      type: 'string',
      allOf: [
        {
          'transform': [
            'trim'
          ]
        },
        {
          'minLength': 21
        }
      ]
    }
  },
  anyRequired: ['name', 'diagram_xml'],
  additionalProperties: false
});

module.exports = {
  validateSaveDiagram,
  validateUpdateDiagram
}