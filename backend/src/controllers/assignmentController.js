const prisma = require('../config/prisma');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

async function assignOfficer(req, res, next) {
  try {
    const {
      applicationId,
      officerId,
      scheduledDate,
      scheduledTime,
      location,
      instructions,
    } = req.body;

    if (!applicationId || !officerId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, Officer, and scheduled date are required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [
          { id: applicationId },
          { applicationNumber: applicationId },
        ],
      },
      include: {
        business: true,
        instrument: { include: { instrumentType: true } },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    const officer = await prisma.officer.findUnique({
      where: { id: officerId },
      include: { user: true },
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found.',
        errorCode: 'OFFICER_NOT_FOUND',
      });
    }

    // Upsert assignment
    const assignment = await prisma.assignment.upsert({
      where: { applicationId: application.id },
      update: {
        officerId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime: scheduledTime || '10:00 AM',
        location: location || application.location,
        instructions: instructions || 'Standard verification per Legal Metrology rules.',
        status: 'PENDING',
      },
      create: {
        applicationId: application.id,
        officerId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime: scheduledTime || '10:00 AM',
        location: location || application.location,
        instructions: instructions || 'Standard verification per Legal Metrology rules.',
        status: 'PENDING',
      },
    });

    // Update application status to ASSIGNED / SCHEDULED
    await prisma.verificationApplication.update({
      where: { id: applicationId },
      data: { status: 'ASSIGNED' },
    });

    // Notify Officer
    await createNotification({
      userId: officer.userId,
      title: `Assignment: ${application.applicationNumber}`,
      message: `You have been assigned to verify ${application.instrument.customId} for ${application.business.businessName} on ${new Date(scheduledDate).toLocaleDateString()}.`,
      type: 'INFO',
      link: `/officer/verification/${applicationId}`,
    });

    // Notify Business Owner
    await createNotification({
      userId: application.business.userId,
      title: `Inspection Scheduled: ${application.applicationNumber}`,
      message: `Inspector ${officer.name} (${officer.officerCode}) has been assigned for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime || '10:00 AM'}.`,
      type: 'INFO',
      link: `/business/applications`,
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'OFFICER_ASSIGNED',
      entity: 'Assignment',
      entityId: assignment.id,
      description: `Officer ${officer.name} (${officer.officerCode}) assigned to ${application.applicationNumber}.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Application successfully assigned to ${officer.name}.`,
      data: { assignment },
    });
  } catch (err) {
    next(err);
  }
}

async function listAssignments(req, res, next) {
  try {
    const where = {};
    if (req.user.role === 'OFFICER') {
      const officer = await prisma.officer.findUnique({ where: { userId: req.user.id } });
      if (officer) {
        where.officerId = officer.id;
      }
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        officer: true,
        application: {
          include: {
            business: true,
            instrument: { include: { instrumentType: true } },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    res.json({
      success: true,
      data: { assignments },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  assignOfficer,
  listAssignments,
};
