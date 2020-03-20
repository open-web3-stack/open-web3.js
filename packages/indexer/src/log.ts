import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      stderrLevels: ['error', 'warn']
    })
  ]
});

export default logger;
