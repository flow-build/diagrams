const { validateBody } = require('./base');

const validateBuildDiagram = validateBody({
  type: 'object',
  required: ['blueprint_spec'],
  properties: {
    blueprint_spec: {
      type: 'object',
      required: ['nodes', 'lanes'],
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'type', 'lane_id', 'next'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              lane_id: { type: 'string' },
              next: { type: ['string', 'object', 'null'] },
              parameters: { type: 'object' },
            },
          },
        },
        lanes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'rule'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              rule: { type: ['object', 'array'] },
            },
          },
        },
      },
    },
  },
});

module.exports = {
  validateBuildDiagram,
};
