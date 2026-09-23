const prisma = require('../config/prisma');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

/**
 * Assign an application to either an LMO (Legal Metrology Officer) or GATC (Approved Test Centre)
 */
async function assignAuthority(req, res, next) {
  try {
    const {
      applicationId,
      authorityType = 'LMO', // 'LMO' or 'GATC'
      officerId,
      gatcId,
      scheduledDate,
      scheduledTime,
      location,
      instructions,
      reason,
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

    const isGatc = authorityType === 'GATC' || (gatcId && !officerId);

    if (isGatc) {
      if (!gatcId) {
        return res.status(400).json({
          success: false,
          message: 'GATC selection is required for GATC assignment.',
          errorCode: 'GATC_REQUIRED',
        });
      }

      const gatc = await prisma.gatc.findUnique({
        where: { id: gatcId },
        include: { user: true },
      });

      if (!gatc) {
        return res.status(404).json({
          success: false,
          message: 'Selected GATC test centre not found.',
          errorCode: 'GATC_NOT_FOUND',
        });
      }

      if (gatc.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: `Cannot assign to GATC "${gatc.name}" because its status is ${gatc.status}. Only active and approved test centres may receive assignments.`,
          errorCode: 'GATC_INACTIVE',
        });
      }

      // Upsert assignment for GATC
      const assignment = await prisma.assignment.upsert({
        where: { applicationId: application.id },
        update: {
          assignedAuthority: 'GATC',
          gatcId: gatc.id,
          officerId: null,
          scheduledDate: new Date(scheduledDate),
          scheduledTime: scheduledTime || '10:00 AM',
          location: location || gatc.address || application.location,
          instructions: instructions || 'Perform laboratory verification and tests per OIML standards.',
          status: 'PENDING',
          rejectionReason: null,
        },
        create: {
          applicationId: application.id,
          assignedAuthority: 'GATC',
          gatcId: gatc.id,
          officerId: null,
          scheduledDate: new Date(scheduledDate),
          scheduledTime: scheduledTime || '10:00 AM',
          location: location || gatc.address || application.location,
          instructions: instructions || 'Perform laboratory verification and tests per OIML standards.',
          status: 'PENDING',
        },
      });

      // Update application status
      await prisma.verificationApplication.update({
        where: { id: application.id },
        data: { status: 'GATC_ASSIGNED' },
      });

      // Record in immutable AssignmentHistory
      await prisma.assignmentHistory.create({
        data: {
          applicationId: application.id,
          authorityType: 'GATC',
          gatcId: gatc.id,
          gatcName: gatc.name,
          action: 'ASSIGNED',
          reason: reason || 'Allocated to Government Approved Test Centre for verification.',
          scheduledDate: new Date(scheduledDate),
          assignedBy: `${req.user.name} (${req.user.role})`,
        },
      });

      // Notify GATC
      if (gatc.userId) {
        await createNotification({
          userId: gatc.userId,
          title: `New Verification Assignment: ${application.applicationNumber}`,
          message: `Your test centre has been assigned to verify ${application.instrument.customId} (${application.business.businessName}) on ${new Date(scheduledDate).toLocaleDateString()}.`,
          type: 'INFO',
          link: `/gatc/applications`,
        });
      }

      // Notify Business
      if (application.business && application.business.userId) {
        await createNotification({
          userId: application.business.userId,
          title: `Assigned to Approved Test Centre: ${application.applicationNumber}`,
          message: `Your verification request has been assigned to Government Approved Test Centre: ${gatc.name} (${gatc.district}).`,
          type: 'INFO',
          link: `/business/applications`,
        });
      }

      await logAudit({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'GATC_ASSIGNED',
        entity: 'Assignment',
        entityId: assignment.id,
        description: `Application ${application.applicationNumber} assigned to GATC "${gatc.name}" (${gatc.gatcCode}).`,
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        message: `Application successfully assigned to GATC "${gatc.name}".`,
        data: { assignment },
      });
    }

    // Default: LMO Assignment
    if (!officerId) {
      return res.status(400).json({
        success: false,
        message: 'Officer selection is required for LMO assignment.',
        errorCode: 'OFFICER_REQUIRED',
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

    const assignment = await prisma.assignment.upsert({
      where: { applicationId: application.id },
      update: {
        assignedAuthority: 'LMO',
        officerId: officer.id,
        gatcId: null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime: scheduledTime || '10:00 AM',
        location: location || application.location,
        instructions: instructions || 'Standard verification per Legal Metrology rules.',
        status: 'PENDING',
        rejectionReason: null,
      },
      create: {
        applicationId: application.id,
        assignedAuthority: 'LMO',
        officerId: officer.id,
        gatcId: null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime: scheduledTime || '10:00 AM',
        location: location || application.location,
        instructions: instructions || 'Standard verification per Legal Metrology rules.',
        status: 'PENDING',
      },
    });

    await prisma.verificationApplication.update({
      where: { id: application.id },
      data: { status: 'ASSIGNED' },
    });

    await prisma.assignmentHistory.create({
      data: {
        applicationId: application.id,
        authorityType: 'LMO',
        officerId: officer.id,
        officerName: officer.name,
        action: 'ASSIGNED',
        reason: reason || 'Allocated to Legal Metrology Officer jurisdiction.',
        scheduledDate: new Date(scheduledDate),
        assignedBy: `${req.user.name} (${req.user.role})`,
      },
    });

    await createNotification({
      userId: officer.userId,
      title: `Assignment: ${application.applicationNumber}`,
      message: `You have been assigned to verify ${application.instrument.customId} for ${application.business.businessName} on ${new Date(scheduledDate).toLocaleDateString()}.`,
      type: 'INFO',
      link: `/officer/verification/${application.id}`,
    });

    if (application.business && application.business.userId) {
      await createNotification({
        userId: application.business.userId,
        title: `Inspection Scheduled: ${application.applicationNumber}`,
        message: `Inspector ${officer.name} (${officer.officerCode}) has been assigned for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime || '10:00 AM'}.`,
        type: 'INFO',
        link: `/business/applications`,
      });
    }

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
      message: `Application successfully assigned to Inspector ${officer.name}.`,
      data: { assignment },
    });
  } catch (err) {
    next(err);
  }
}

// Backward-compatible alias for existing code
async function assignOfficer(req, res, next) {
  return assignAuthority(req, res, next);
}

/**
 * Reassign an application (LMO -> GATC, GATC -> LMO, GATC -> GATC) with mandatory reason and history recording
 */
async function reassignAuthority(req, res, next) {
  try {
    const {
      applicationId,
      authorityType, // 'LMO' or 'GATC'
      officerId,
      gatcId,
      scheduledDate,
      scheduledTime,
      reason,
    } = req.body;

    if (!applicationId || !authorityType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, new authority type, and reassignment reason are required.',
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
        assignment: { include: { officer: true, gatc: true } },
        business: true,
        instrument: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    const previousAssignment = application.assignment;
    const newScheduledDate = scheduledDate ? new Date(scheduledDate) : (previousAssignment ? previousAssignment.scheduledDate : new Date());

    let newGatc = null;
    let newOfficer = null;

    if (authorityType === 'GATC') {
      if (!gatcId) {
        return res.status(400).json({
          success: false,
          message: 'GATC ID is required for GATC reassignment.',
          errorCode: 'GATC_REQUIRED',
        });
      }
      newGatc = await prisma.gatc.findUnique({ where: { id: gatcId } });
      if (!newGatc || newGatc.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Selected GATC is not active or approved.',
          errorCode: 'GATC_INACTIVE',
        });
      }
    } else {
      if (!officerId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required for LMO reassignment.',
          errorCode: 'OFFICER_REQUIRED',
        });
      }
      newOfficer = await prisma.officer.findUnique({ where: { id: officerId } });
      if (!newOfficer || newOfficer.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Selected Officer is not active.',
          errorCode: 'OFFICER_INACTIVE',
        });
      }
    }

    // Update assignment
    const updatedAssignment = await prisma.assignment.upsert({
      where: { applicationId: application.id },
      update: {
        assignedAuthority: authorityType,
        gatcId: authorityType === 'GATC' ? newGatc.id : null,
        officerId: authorityType === 'LMO' ? newOfficer.id : null,
        scheduledDate: newScheduledDate,
        scheduledTime: scheduledTime || (previousAssignment?.scheduledTime || '10:00 AM'),
        status: 'PENDING',
        rejectionReason: null,
      },
      create: {
        applicationId: application.id,
        assignedAuthority: authorityType,
        gatcId: authorityType === 'GATC' ? newGatc.id : null,
        officerId: authorityType === 'LMO' ? newOfficer.id : null,
        scheduledDate: newScheduledDate,
        scheduledTime: scheduledTime || '10:00 AM',
        location: application.location,
        status: 'PENDING',
      },
    });

    // Update application status
    await prisma.verificationApplication.update({
      where: { id: application.id },
      data: { status: authorityType === 'GATC' ? 'GATC_ASSIGNED' : 'ASSIGNED' },
    });

    // Record in AssignmentHistory
    await prisma.assignmentHistory.create({
      data: {
        applicationId: application.id,
        authorityType,
        officerId: newOfficer ? newOfficer.id : (previousAssignment ? previousAssignment.officerId : null),
        officerName: newOfficer ? newOfficer.name : (previousAssignment?.officer ? previousAssignment.officer.name : null),
        gatcId: newGatc ? newGatc.id : (previousAssignment ? previousAssignment.gatcId : null),
        gatcName: newGatc ? newGatc.name : (previousAssignment?.gatc ? previousAssignment.gatc.name : null),
        action: 'REASSIGNED',
        reason,
        scheduledDate: newScheduledDate,
        assignedBy: `${req.user.name} (${req.user.role})`,
      },
    });

    // Notify newly assigned entity
    if (newGatc && newGatc.userId) {
      await createNotification({
        userId: newGatc.userId,
        title: `Reassigned Verification: ${application.applicationNumber}`,
        message: `Case reassigned to your test centre: ${application.instrument.customId} (${application.business.businessName}). Reason: ${reason}`,
        type: 'WARNING',
        link: '/gatc/applications',
      });
    } else if (newOfficer && newOfficer.userId) {
      await createNotification({
        userId: newOfficer.userId,
        title: `Reassigned Case: ${application.applicationNumber}`,
        message: `Case reassigned to you: ${application.instrument.customId} (${application.business.businessName}). Reason: ${reason}`,
        type: 'INFO',
        link: `/officer/verification/${application.id}`,
      });
    }

    // Notify Business
    if (application.business && application.business.userId) {
      const authorityLabel = authorityType === 'GATC' ? `GATC: ${newGatc.name}` : `Inspector ${newOfficer.name}`;
      await createNotification({
        userId: application.business.userId,
        title: `Verification Authority Updated: ${application.applicationNumber}`,
        message: `Your application has been reassigned to ${authorityLabel}.`,
        type: 'INFO',
        link: '/business/applications',
      });
    }

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'AUTHORITY_REASSIGNED',
      entity: 'Assignment',
      entityId: updatedAssignment.id,
      description: `Reassigned ${application.applicationNumber} to ${authorityType === 'GATC' ? newGatc.name : newOfficer.name}. Reason: ${reason}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Application successfully reassigned.',
      data: { assignment: updatedAssignment },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GATC Accepts Assignment
 */
async function acceptAssignment(req, res, next) {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required.',
        errorCode: 'APPLICATION_ID_REQUIRED',
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
        assignment: { include: { gatc: true, officer: true } },
        business: true,
        instrument: true,
      },
    });

    if (!application || !application.assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found for this application.',
        errorCode: 'ASSIGNMENT_NOT_FOUND',
      });
    }

    // Update assignment status
    const updatedAssignment = await prisma.assignment.update({
      where: { id: application.assignment.id },
      data: {
        status: 'ACCEPTED',
      },
    });

    // Update application status
    await prisma.verificationApplication.update({
      where: { id: application.id },
      data: {
        status: application.assignment.assignedAuthority === 'GATC' ? 'GATC_IN_PROGRESS' : 'SCHEDULED',
      },
    });

    // Record in history
    await prisma.assignmentHistory.create({
      data: {
        applicationId: application.id,
        authorityType: application.assignment.assignedAuthority,
        gatcId: application.assignment.gatcId,
        gatcName: application.assignment.gatc?.name,
        officerId: application.assignment.officerId,
        officerName: application.assignment.officer?.name,
        action: 'ACCEPTED',
        reason: 'Assignment accepted and scheduled for testing.',
        scheduledDate: application.assignment.scheduledDate,
        assignedBy: `${req.user.name} (${req.user.role})`,
      },
    });

    // Notify Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: `Assignment Accepted: ${application.applicationNumber}`,
        message: `${application.assignment.gatc?.name || 'Testing Authority'} accepted verification assignment for ${application.instrument.customId}.`,
        type: 'SUCCESS',
        link: `/admin/applications/${application.id}`,
      });
    }

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'ASSIGNMENT_ACCEPTED',
      entity: 'Assignment',
      entityId: updatedAssignment.id,
      description: `Assignment accepted for ${application.applicationNumber}.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Assignment accepted successfully. Testing can now commence.',
      data: { assignment: updatedAssignment },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GATC Rejects Assignment (Requests Reassignment)
 */
async function rejectAssignment(req, res, next) {
  try {
    const { applicationId, reason } = req.body;

    if (!applicationId || !reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and a detailed rejection reason are required.',
        errorCode: 'REASON_REQUIRED',
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
        assignment: { include: { gatc: true, officer: true } },
        business: true,
        instrument: true,
      },
    });

    if (!application || !application.assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found for this application.',
        errorCode: 'ASSIGNMENT_NOT_FOUND',
      });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: application.assignment.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason.trim(),
      },
    });

    await prisma.verificationApplication.update({
      where: { id: application.id },
      data: {
        status: 'UNDER_REVIEW',
        rejectionReason: `Reassignment requested: ${reason.trim()}`,
      },
    });

    // Record in history
    await prisma.assignmentHistory.create({
      data: {
        applicationId: application.id,
        authorityType: application.assignment.assignedAuthority,
        gatcId: application.assignment.gatcId,
        gatcName: application.assignment.gatc?.name,
        officerId: application.assignment.officerId,
        officerName: application.assignment.officer?.name,
        action: 'REJECTED',
        reason: reason.trim(),
        scheduledDate: application.assignment.scheduledDate,
        assignedBy: `${req.user.name} (${req.user.role})`,
      },
    });

    // Notify Admins to reassign
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: `Reassignment Requested: ${application.applicationNumber}`,
        message: `${application.assignment.gatc?.name || 'Assigned Authority'} requested reassignment for ${application.instrument.customId}. Reason: ${reason.trim()}`,
        type: 'WARNING',
        link: `/admin/applications/${application.id}`,
      });
    }

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'ASSIGNMENT_REJECTED',
      entity: 'Assignment',
      entityId: updatedAssignment.id,
      description: `Assignment rejected/reassignment requested for ${application.applicationNumber}: ${reason.trim()}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Reassignment request submitted to the administrator.',
      data: { assignment: updatedAssignment },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List assignments filtered by role
 */
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
            verification: { include: { measurements: true, evidence: true } },
            certificate: true,
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

/**
 * Get full assignment and reassignment history for an application
 */
async function getAssignmentHistory(req, res, next) {
  try {
    const { applicationId } = req.params;

    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [
          { id: applicationId },
          { applicationNumber: applicationId },
        ],
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    const history = await prisma.assignmentHistory.findMany({
      where: { applicationId: application.id },
      orderBy: { assignedAt: 'desc' },
    });

    res.json({
      success: true,
      data: { history },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  assignAuthority,
  assignOfficer,
  reassignAuthority,
  acceptAssignment,
  rejectAssignment,
  listAssignments,
  getAssignmentHistory,
};
