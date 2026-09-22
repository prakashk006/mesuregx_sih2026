const prisma = require('../config/prisma');
const { generateApplicationNumber, isValidTransition } = require('../utils/statusHelper');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

async function createApplication(req, res, next) {
  try {
    const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(400).json({
        success: false,
        message: 'No registered business profile found for this account.',
        errorCode: 'BUSINESS_NOT_FOUND',
      });
    }

    const {
      instrumentId,
      applicationType = 'Periodic Verification',
      preferredDate,
      location,
      remarks,
    } = req.body;

    if (!instrumentId || !location) {
      return res.status(400).json({
        success: false,
        message: 'Instrument and verification location are required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    // Verify instrument belongs to this business
    const instrument = await prisma.instrument.findUnique({
      where: { id: instrumentId },
      include: { instrumentType: true },
    });

    if (!instrument || instrument.businessId !== business.id) {
      return res.status(404).json({
        success: false,
        message: 'Selected instrument not found or does not belong to your business.',
        errorCode: 'INSTRUMENT_NOT_FOUND',
      });
    }

    // Generate unique application number
    const totalCount = await prisma.verificationApplication.count();
    const applicationNumber = generateApplicationNumber(totalCount + 1);

    const application = await prisma.verificationApplication.create({
      data: {
        applicationNumber,
        businessId: business.id,
        instrumentId,
        applicationType,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        location,
        remarks,
        status: 'SUBMITTED',
      },
      include: {
        instrument: {
          include: { instrumentType: true },
        },
        business: true,
      },
    });

    // Notify Business Owner
    await createNotification({
      userId: req.user.id,
      title: `Application ${application.applicationNumber} Submitted`,
      message: `Verification request submitted for ${instrument.customId} (${instrument.instrumentType.name}).`,
      type: 'INFO',
      link: '/business/applications',
    });

    // Notify Officers in district or all active officers
    const officers = await prisma.officer.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ district: business.district }, { district: 'Coimbatore' }],
      },
      include: { user: true },
    });

    for (const off of officers) {
      await createNotification({
        userId: off.userId,
        title: `New Verification Application: ${application.applicationNumber}`,
        message: `${business.businessName} requested verification for ${instrument.customId} in ${business.district}.`,
        type: 'INFO',
        link: `/officer/applications/${application.id}`,
      });
    }

    // Audit log
    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'APPLICATION_SUBMITTED',
      entity: 'Application',
      entityId: application.id,
      description: `Application ${application.applicationNumber} submitted by ${business.businessName} for ${instrument.customId}.`,
      ipAddress: req.ip,
    });

    // Email dispatch (graceful)
    await sendEmail({
      to: business.email,
      subject: `[MESUREGX] Verification Application Received: ${application.applicationNumber}`,
      text: `Dear ${business.ownerName},\n\nYour application ${application.applicationNumber} for verification of ${instrument.customId} has been successfully submitted.\n\nOur Legal Metrology field officer will review and schedule an inspection shortly.\n\nRegards,\nDepartment of Legal Metrology`,
    });

    res.status(201).json({
      success: true,
      message: `Application ${application.applicationNumber} submitted successfully.`,
      data: { application },
    });
  } catch (err) {
    next(err);
  }
}

async function listApplications(req, res, next) {
  try {
    const {
      status,
      district,
      instrumentType,
      search,
      page = 1,
      limit = 20,
      assignedToMe,
    } = req.query;

    const where = {};

    if (req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (!business) return res.json({ success: true, data: { applications: [], pagination: {} } });
      where.businessId = business.id;
    } else if (req.user.role === 'OFFICER' && assignedToMe === 'true') {
      const officer = await prisma.officer.findUnique({ where: { userId: req.user.id } });
      if (officer) {
        where.assignment = { officerId: officer.id };
      }
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (district && district !== 'ALL') {
      where.business = { district };
    }

    if (instrumentType && instrumentType !== 'ALL') {
      where.instrument = {
        instrumentType: {
          code: instrumentType,
        },
      };
    }

    if (search) {
      where.OR = [
        { applicationNumber: { contains: search } },
        { location: { contains: search } },
        { business: { businessName: { contains: search } } },
        { business: { ownerName: { contains: search } } },
        { instrument: { customId: { contains: search } } },
        { instrument: { serialNumber: { contains: search } } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [total, applications] = await Promise.all([
      prisma.verificationApplication.count({ where }),
      prisma.verificationApplication.findMany({
        where,
        include: {
          business: {
            select: { id: true, businessName: true, ownerName: true, district: true, city: true, mobile: true },
          },
          instrument: {
            include: { instrumentType: true },
          },
          assignment: {
            include: { officer: true },
          },
          verification: {
            select: { id: true, overallResult: true, verificationDate: true, status: true },
          },
          certificate: {
            select: { id: true, certificateNumber: true, status: true, expiryDate: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;

    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [
          { id },
          { applicationNumber: id },
        ],
      },
      include: {
        business: true,
        instrument: {
          include: {
            instrumentType: true,
          },
        },
        assignment: {
          include: {
            officer: true,
          },
        },
        verification: {
          include: {
            measurements: {
              orderBy: { testNumber: 'asc' },
            },
            evidence: {
              orderBy: { uploadedAt: 'desc' },
            },
            officer: true,
          },
        },
        certificate: {
          include: {
            officer: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    if (req.user.role === 'BUSINESS_OWNER' && application.business.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        errorCode: 'FORBIDDEN',
      });
    }

    res.json({
      success: true,
      data: { application },
    });
  } catch (err) {
    next(err);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, rejectionReason, retestDate, remarks } = req.body;

    const application = await prisma.verificationApplication.findUnique({
      where: { id },
      include: { business: true, instrument: true },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    if (!isValidTransition(application.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${application.status}" to "${status}".`,
        errorCode: 'INVALID_TRANSITION',
      });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory when rejecting an application.',
        errorCode: 'REJECTION_REASON_REQUIRED',
      });
    }

    const updated = await prisma.verificationApplication.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason || application.rejectionReason,
        retestDate: retestDate ? new Date(retestDate) : application.retestDate,
        remarks: remarks || application.remarks,
      },
      include: {
        business: true,
        instrument: true,
      },
    });

    // Notify Business Owner
    await createNotification({
      userId: application.business.userId,
      title: `Application ${application.applicationNumber}: Status Changed to ${status}`,
      message: status === 'REJECTED'
        ? `Application was rejected: ${rejectionReason}`
        : `Application status updated to ${status}.`,
      type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'DANGER' : 'INFO',
      link: `/business/applications`,
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: `APPLICATION_${status}`,
      entity: 'Application',
      entityId: application.id,
      description: `Application ${application.applicationNumber} status changed from ${application.status} to ${status}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: { application: updated },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
};
