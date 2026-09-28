const prisma = require('../config/prisma');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

async function assignOfficer(req, res, next) {
  try {
    const {
      applicationId,
      assignedAuthority = 'LMO',
      officerId,
      gatcId,
      scheduledDate,
      scheduledTime,
      location,
      instructions,
    } = req.body;

    if (!applicationId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and scheduled date are required.',
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

    let targetOfficer = null;
    let targetGatc = null;
    let assignmentData = {
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime || '10:00 AM',
      location: location || application.location,
      instructions: instructions || 'Standard verification per Legal Metrology rules.',
      status: 'PENDING',
    };

    if (assignedAuthority === 'GATC') {
      if (!gatcId) {
        return res.status(400).json({
          success: false,
          message: 'GATC Facility selection is required when authority is GATC.',
          errorCode: 'GATC_REQUIRED',
        });
      }

      targetGatc = await prisma.gatc.findUnique({
        where: { id: gatcId },
        include: { user: true },
      });

      if (!targetGatc) {
        return res.status(404).json({
          success: false,
          message: 'Selected GATC facility not found.',
          errorCode: 'GATC_NOT_FOUND',
        });
      }

      assignmentData.assignedAuthority = 'GATC';
      assignmentData.gatcId = targetGatc.id;
      assignmentData.officerId = null;
    } else {
      if (!officerId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required when authority is LMO.',
          errorCode: 'OFFICER_REQUIRED',
        });
      }

      targetOfficer = await prisma.officer.findUnique({
        where: { id: officerId },
        include: { user: true },
      });

      if (!targetOfficer) {
        return res.status(404).json({
          success: false,
          message: 'Officer not found.',
          errorCode: 'OFFICER_NOT_FOUND',
        });
      }

      assignmentData.assignedAuthority = 'LMO';
      assignmentData.officerId = targetOfficer.id;
      assignmentData.gatcId = null;
    }

    // Upsert assignment
    const assignment = await prisma.assignment.upsert({
      where: { applicationId: application.id },
      update: assignmentData,
      create: {
        applicationId: application.id,
        ...assignmentData,
      },
      include: {
        officer: true,
        gatc: true,
      },
    });

    const newAppStatus = assignedAuthority === 'GATC' ? 'GATC_ASSIGNED' : 'ASSIGNED';
    await prisma.verificationApplication.update({
      where: { id: application.id },
      data: { status: newAppStatus },
    });

    if (assignedAuthority === 'GATC') {
      await createNotification({
        userId: targetGatc.userId,
        title: `GATC Allocation: ${application.applicationNumber}`,
        message: `Your laboratory has been allocated testing for ${application.instrument.customId} (${application.business.businessName}) on ${new Date(scheduledDate).toLocaleDateString()}.`,
        type: 'INFO',
        link: `/gatc/assignments`,
      });

      await createNotification({
        userId: application.business.userId,
        title: `Verification Allocated to GATC: ${application.applicationNumber}`,
        message: `Your application has been allocated to authorized laboratory ${targetGatc.name} (${targetGatc.authorizationNo}) for verification on ${new Date(scheduledDate).toLocaleDateString()}.`,
        type: 'INFO',
        link: `/business/applications`,
      });

      await logAudit({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'GATC_ALLOCATED',
        entity: 'Assignment',
        entityId: assignment.id,
        description: `Application ${application.applicationNumber} allocated to GATC "${targetGatc.name}".`,
        ipAddress: req.ip,
      });
    } else {
      await createNotification({
        userId: targetOfficer.userId,
        title: `Assignment: ${application.applicationNumber}`,
        message: `You have been assigned to verify ${application.instrument.customId} for ${application.business.businessName} on ${new Date(scheduledDate).toLocaleDateString()}.`,
        type: 'INFO',
        link: `/officer/verification/${application.id}`,
      });

      await createNotification({
        userId: application.business.userId,
        title: `Inspection Scheduled: ${application.applicationNumber}`,
        message: `Inspector ${targetOfficer.name} (${targetOfficer.officerCode}) has been assigned for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime || '10:00 AM'}.`,
        type: 'INFO',
        link: `/business/applications`,
      });

      await logAudit({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'OFFICER_ASSIGNED',
        entity: 'Assignment',
        entityId: assignment.id,
        description: `Officer ${targetOfficer.name} (${targetOfficer.officerCode}) assigned to ${application.applicationNumber}.`,
        ipAddress: req.ip,
      });
    }

    res.json({
      success: true,
      message: `Application successfully allocated to ${assignedAuthority === 'GATC' ? targetGatc.name : targetOfficer.name}.`,
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
    } else if (req.user.role === 'GATC') {
      const gatc = await prisma.gatc.findUnique({ where: { userId: req.user.id } });
      if (gatc) {
        where.gatcId = gatc.id;
      }
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        officer: true,
        gatc: true,
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
  assignAuthority: assignOfficer,
  listAssignments,
};
