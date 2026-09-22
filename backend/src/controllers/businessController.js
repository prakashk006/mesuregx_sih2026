const prisma = require('../config/prisma');
const { getDynamicCertificateStatus } = require('../utils/statusHelper');
const { logAudit } = require('../services/auditService');

async function getProfile(req, res, next) {
  try {
    const business = await prisma.business.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { email: true, name: true, phone: true, createdAt: true },
        },
      },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found.',
        errorCode: 'PROFILE_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { business },
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const business = await prisma.business.findUnique({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found.',
        errorCode: 'PROFILE_NOT_FOUND',
      });
    }

    const {
      businessName,
      ownerName,
      mobile,
      address,
      city,
      district,
      state,
      pincode,
      businessType,
      gstNumber,
    } = req.body;

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: {
        businessName: businessName || business.businessName,
        ownerName: ownerName || business.ownerName,
        mobile: mobile || business.mobile,
        address: address || business.address,
        city: city || business.city,
        district: district || business.district,
        state: state || business.state,
        pincode: pincode || business.pincode,
        businessType: businessType || business.businessType,
        gstNumber: gstNumber !== undefined ? gstNumber : business.gstNumber,
      },
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'BUSINESS_PROFILE_UPDATED',
      entity: 'Business',
      entityId: business.id,
      description: `Business profile updated for "${updated.businessName}".`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Business profile updated successfully.',
      data: { business: updated },
    });
  } catch (err) {
    next(err);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const business = await prisma.business.findUnique({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found.',
        errorCode: 'BUSINESS_NOT_FOUND',
      });
    }

    const businessId = business.id;

    // 1. Total Instruments
    const totalInstruments = await prisma.instrument.count({
      where: { businessId },
    });

    // 2. Pending Applications
    const pendingApplications = await prisma.verificationApplication.count({
      where: {
        businessId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'SCHEDULED', 'FIELD_VERIFICATION', 'OFFICER_REVIEW'] },
      },
    });

    // 3. Certificates and Verified Instruments
    const certificates = await prisma.certificate.findMany({
      where: { businessId },
      include: {
        instrument: {
          include: { instrumentType: true },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    let verifiedCount = 0;
    let expiringSoonCount = 0;
    const expiryAlerts = [];

    const now = new Date();
    const msIn30Days = 30 * 24 * 60 * 60 * 1000;

    for (const cert of certificates) {
      const dynamicStatus = getDynamicCertificateStatus(cert);
      const expiry = new Date(cert.expiryDate);
      const diffMs = expiry.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

      if (dynamicStatus === 'VALID' || dynamicStatus === 'EXPIRING_SOON') {
        verifiedCount++;
      }

      if (dynamicStatus === 'EXPIRING_SOON' || (diffMs > 0 && diffMs <= msIn30Days)) {
        expiringSoonCount++;
        expiryAlerts.push({
          certificateId: cert.id,
          certificateNumber: cert.certificateNumber,
          instrumentId: cert.instrument.customId,
          instrumentName: cert.instrument.instrumentType.name,
          expiryDate: cert.expiryDate,
          daysRemaining: Math.max(0, daysRemaining),
          status: 'EXPIRING_SOON',
        });
      }
    }

    // 4. Status breakdown
    const allApps = await prisma.verificationApplication.findMany({
      where: { businessId },
      select: { status: true },
    });

    const statusCounts = {
      SUBMITTED: 0,
      SCHEDULED: 0,
      FIELD_VERIFICATION: 0,
      APPROVED: 0,
      REJECTED: 0,
      CERTIFICATE_ISSUED: 0,
    };

    allApps.forEach((a) => {
      if (statusCounts[a.status] !== undefined) {
        statusCounts[a.status]++;
      }
    });

    // 5. Recent Applications
    const recentApplications = await prisma.verificationApplication.findMany({
      where: { businessId },
      include: {
        instrument: {
          include: { instrumentType: true },
        },
        assignment: {
          include: { officer: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalInstruments,
          pendingApplications,
          verifiedInstruments: verifiedCount,
          expiringSoon: expiringSoonCount,
        },
        statusChart: [
          { name: 'Pending Review', value: statusCounts.SUBMITTED, color: '#3b82f6' },
          { name: 'Scheduled', value: statusCounts.SCHEDULED, color: '#f59e0b' },
          { name: 'Under Verification', value: statusCounts.FIELD_VERIFICATION, color: '#8b5cf6' },
          { name: 'Approved', value: statusCounts.APPROVED + statusCounts.CERTIFICATE_ISSUED, color: '#10b981' },
          { name: 'Rejected', value: statusCounts.REJECTED, color: '#ef4444' },
        ],
        recentApplications: recentApplications.map((app) => ({
          id: app.id,
          applicationNumber: app.applicationNumber,
          instrumentId: app.instrument.customId,
          instrumentName: app.instrument.instrumentType.name,
          manufacturer: app.instrument.manufacturer,
          model: app.instrument.model,
          submittedDate: app.createdAt,
          status: app.status,
          assignedOfficer: app.assignment?.officer?.name || 'Unassigned',
        })),
        expiryAlerts,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboardStats,
};
