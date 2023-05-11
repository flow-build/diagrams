require('dotenv').config();
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.label({ label: 'Diagrams' }),
    format.printf(
      (info) =>
        `${info.timestamp} ${info.level}: [${info.label}] ${info.message}`
    )
  ),
  transports: [new transports.Console()],
  exceptionHandlers: [
    new transports.Console({
      format: format.errors(),
    }),
  ],
  rejectionHandlers: [new transports.Console()],
});

module.exports = {
  logger,
};
