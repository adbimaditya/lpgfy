import type { Logger } from '@playwright/test';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console(), new transports.File({ filename: 'combined.log' })],
});

export const playwrightLogger: Logger = {
  isEnabled: () => true,
  log: (name, severity, message, args) => {
    logger.log({
      level: severity,
      message: `${name}: ${message}`,
      args,
    });
  },
};

export default logger;
