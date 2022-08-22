const { validateBody } = require('./base');

const validateSaveDiagram = validateBody({
  type: 'object',
  required: ['name', 'user_id', 'diagram_xml'],
  properties: {
    name: { type: 'string' },
    user_id: { type: 'string' },
    diagram_xml: { type: 'string' },
    workflow_id: { type: 'string', format: 'uuid' }
  },
  additionalProperties: false
});

const validateUpdateDiagram = validateBody({
  type: 'object',
  properties: {
    name: { type: 'string' },
    diagram_xml: { type: 'string' }
  },
  anyRequired: ['name', 'diagram_xml'],
  additionalProperties: false
});

module.exports = {
  validateSaveDiagram,
  validateUpdateDiagram
}