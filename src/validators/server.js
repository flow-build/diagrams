const { validateBody } = require('./base');

const validateServer = validateBody({
  type: 'object',
  required: ['url'],
  properties: {
    url: { type: 'string' },
    namespace: { type: 'string' },
    brokerUrl: { type: 'string' },
  }
});

module.exports = {
  validateServer,
}