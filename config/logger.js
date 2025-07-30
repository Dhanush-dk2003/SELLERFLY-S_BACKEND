import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'access.log' })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  )
});

export default logger;
