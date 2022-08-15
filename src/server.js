const { startServer } = require('./app');
const port = process.env.PORT || 5000;

const server = startServer(port);

module.exports = server;