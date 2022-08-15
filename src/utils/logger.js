const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
  ),
  transports: [new transports.Console()],
  exceptionHandlers: [
    new transports.Console({
      format: format.errors()
    }),
  ],
  rejectionHandlers: [new transports.Console()]
})

module.exports = {
  logger
}