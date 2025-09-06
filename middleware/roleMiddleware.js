import logger from '../config/logger.js';

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    logger.warn(`Unauthorized ADMIN access by ${req.user.officialEmail}`); // Changed from req.user.email
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};

export const isManager = (req, res, next) => {
  if (req.user.role !== 'MANAGER') {
    logger.warn(`Unauthorized MANAGER access by ${req.user.officialEmail}`); // Changed from req.user.email
    return res.status(403).json({ message: 'Managers only' });
  }
  next();
};

export const isUser = (req, res, next) => {
  if (req.user.role !== 'USER') {
    logger.warn(`Unauthorized USER access by ${req.user.officialEmail}`); // Changed from req.user.email
    return res.status(403).json({ message: 'Users only' });
  }
  next();
};

export const isAdminOrManager = (req, res, next) => {
  if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') {
    return next();
  }
  logger.warn(`Unauthorized project access by ${req.user.officialEmail}`, { timestamp: new Date().toISOString() }); // Changed from req.user.email
  return res.status(403).json({ message: 'Access denied' });
};
export const isAdminOrManagerOrUser = (req, res, next) => {
  if (['ADMIN', 'MANAGER', 'USER'].includes(req.user.role)) {
    return next();
  }
  logger.warn(`Unauthorized project access by ${req.user.officialEmail}`, { timestamp: new Date().toISOString() });
  return res.status(403).json({ message: 'Access denied' });
};