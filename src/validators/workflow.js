const { validateBody } = require('./base');

const validateBuildDiagram = validateBody({
  type: 'object',
  required: ['blueprint_spec'],
  properties: {
    blueprint_spec: {
      type: 'object',
      required: ['nodes'],
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object'
          }
        },
        lanes: {
          type: 'array',
          items: {
            type: 'object'
          }
        }
      }
    }
  },
  additionalProperties: false
});

module.exports = {
  validateBuildDiagram,
}