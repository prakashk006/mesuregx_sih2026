const prisma = require('../config/prisma');

async function createNotification({ userId, title, message, type = 'INFO', link = null }) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
  } catch (err) {
    console.error('Notification creation error (non-fatal):', err.message);
    return null;
  }
}

module.exports = {
  createNotification,
};
