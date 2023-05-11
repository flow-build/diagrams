const { validateBody } = require('./base');

const validateServer = validateBody({
  type: 'object',
  required: ['url'],
  properties: {
    url: { type: 'string' },
    namespace: { type: 'string' },
    config: { type: 'object' },
  }
});

module.exports = {
  validateServer,
}