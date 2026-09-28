const prisma = require('../config/prisma');
const { createNotification } = require('./notificationService');
const { logAudit } = require('./auditService');

/**
 * Automated Statutory Certificate Validity & Expiry Alert Scanner
 * Evaluates active certificates and triggers 30-day, 15-day, 7-day, and expiration alerts.
 */
async function runExpiryAlertScan(triggeredByUserId = null) {
  try {
    const now = new Date();
    let totalScanned = 0;
    let alertsSent = 0;
    let expiredMarked = 0;

    const activeCertificates = await prisma.certificate.findMany({
      where: {
        status: { in: ['VALID', 'EXPIRING_SOON'] },
      },
      include: {
        business: true,
        instrument: { include: { instrumentType: true } },
      },
    });

    totalScanned = activeCertificates.length;

    for (const cert of activeCertificates) {
      const expiry = new Date(cert.expiryDate);
      const diffMs = expiry.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        // 1. Certificate has EXPIRED
        await prisma.certificate.update({
          where: { id: cert.id },
          data: { status: 'EXPIRED' },
        });

        if (cert.instrument?.currentCertificateId === cert.id) {
          await prisma.instrument.update({
            where: { id: cert.instrumentId },
            data: { status: 'EXPIRED' },
          });
        }

        // Avoid duplicate spam: check if notified in the last 48 hours
        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: cert.business.userId,
            title: { contains: cert.certificateNumber },
            createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
          },
        });

        if (!recentNotif) {
          await createNotification({
            userId: cert.business.userId,
            title: `Certificate EXPIRED: ${cert.certificateNumber}`,
            message: `The digital verification certificate for ${cert.instrument.customId} (${cert.instrument.manufacturer} ${cert.instrument.model}) has EXPIRED. Commercial use without re-verification is prohibited under Legal Metrology Rules.`,
            type: 'DANGER',
            link: `/business/apply?instrumentId=${cert.instrumentId}&applicationType=Re-verification&prevCert=${cert.certificateNumber}`,
          });

          await logAudit({
            userId: triggeredByUserId || cert.business.userId,
            userRole: 'SYSTEM',
            action: 'CERTIFICATE_EXPIRED',
            entity: 'Certificate',
            entityId: cert.id,
            description: `Certificate ${cert.certificateNumber} reached expiry date (${expiry.toLocaleDateString()}). Marked EXPIRED.`,
          });

          alertsSent++;
        }
        expiredMarked++;
      } else if (daysRemaining <= 7) {
        // 2. Critical Alert: <= 7 Days
        if (cert.status !== 'EXPIRING_SOON') {
          await prisma.certificate.update({ where: { id: cert.id }, data: { status: 'EXPIRING_SOON' } });
        }

        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: cert.business.userId,
            title: { contains: `7 Days` },
            message: { contains: cert.certificateNumber },
          },
        });

        if (!recentNotif) {
          await createNotification({
            userId: cert.business.userId,
            title: `CRITICAL: Certificate Expires in ${daysRemaining} Days`,
            message: `Verification certificate ${cert.certificateNumber} for ${cert.instrument.customId} expires in ${daysRemaining} days (${expiry.toLocaleDateString()}). Submit re-verification immediately to avoid stamping lapse.`,
            type: 'DANGER',
            link: `/business/apply?instrumentId=${cert.instrumentId}&applicationType=Re-verification&prevCert=${cert.certificateNumber}`,
          });
          alertsSent++;
        }
      } else if (daysRemaining <= 15) {
        // 3. Urgent Reminder: <= 15 Days
        if (cert.status !== 'EXPIRING_SOON') {
          await prisma.certificate.update({ where: { id: cert.id }, data: { status: 'EXPIRING_SOON' } });
        }

        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: cert.business.userId,
            title: { contains: `15 Days` },
            message: { contains: cert.certificateNumber },
          },
        });

        if (!recentNotif) {
          await createNotification({
            userId: cert.business.userId,
            title: `URGENT: Re-verification Due in ${daysRemaining} Days`,
            message: `Certificate ${cert.certificateNumber} for ${cert.instrument.customId} expires in ${daysRemaining} days. Schedule inspection now.`,
            type: 'WARNING',
            link: `/business/apply?instrumentId=${cert.instrumentId}&applicationType=Re-verification&prevCert=${cert.certificateNumber}`,
          });
          alertsSent++;
        }
      } else if (daysRemaining <= 30) {
        // 4. Advisory Notice: <= 30 Days
        if (cert.status !== 'EXPIRING_SOON') {
          await prisma.certificate.update({ where: { id: cert.id }, data: { status: 'EXPIRING_SOON' } });
        }

        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: cert.business.userId,
            title: { contains: `30 Days` },
            message: { contains: cert.certificateNumber },
          },
        });

        if (!recentNotif) {
          await createNotification({
            userId: cert.business.userId,
            title: `Notice: Certificate Expires in ${daysRemaining} Days`,
            message: `Certificate ${cert.certificateNumber} for ${cert.instrument.customId} will expire on ${expiry.toLocaleDateString()}. Re-verification window is now open.`,
            type: 'INFO',
            link: `/business/apply?instrumentId=${cert.instrumentId}&applicationType=Re-verification&prevCert=${cert.certificateNumber}`,
          });
          alertsSent++;
        }
      }
    }

    return {
      success: true,
      totalScanned,
      expiredMarked,
      alertsSent,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Expiry alert scan error:', err);
    throw err;
  }
}

module.exports = {
  runExpiryAlertScan,
};
