const prisma = require('../config/prisma');

async function logAudit({ userId, userRole, action, entity, entityId, description, ipAddress }) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userRole: userRole || 'SYSTEM',
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        description,
        ipAddress: ipAddress || '127.0.0.1',
      },
    });
  } catch (err) {
    console.error('Audit log error (non-fatal):', err.message);
    return null;
  }
}

module.exports = {
  logAudit,
};
