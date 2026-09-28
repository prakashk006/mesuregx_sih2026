const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'mesuregx_default_secret_jwt_metrology';

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing. Please log in.',
        errorCode: 'UNAUTHORIZED',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        business: true,
        officer: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please log in again.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
        errorCode: 'ACCOUNT_INACTIVE',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
        errorCode: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
      errorCode: 'INVALID_TOKEN',
    });
  }
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        errorCode: 'UNAUTHORIZED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        errorCode: 'FORBIDDEN',
      });
    }

    next();
  };
}

async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { business: true, officer: true },
      });
      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token on optional routes
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireRole,
  JWT_SECRET,
};
