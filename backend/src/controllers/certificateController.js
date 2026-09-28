const prisma = require('../config/prisma');
const { getDynamicCertificateStatus } = require('../utils/statusHelper');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

/**
 * Format a single certificate object into standard frontend-ready representation
 */
function formatCertificate(cert) {
  const currentCertId = cert.instrument?.currentCertificateId;
  const dynamicStatus = getDynamicCertificateStatus(cert, currentCertId);
  const isCurrent = currentCertId ? cert.id === currentCertId : (dynamicStatus === 'VALID' || dynamicStatus === 'EXPIRING_SOON');
  const authorityType = cert.issuedByType || (cert.officerId ? 'LMO' : 'GATC');
  const authorityName = authorityType === 'GATC'
    ? (cert.gatcName || cert.gatc?.name || 'GATC Accredited Laboratory')
    : (cert.officer?.name || 'Legal Metrology Officer');

  return {
    id: cert.id,
    certificateNumber: cert.certificateNumber,
    instrumentId: cert.instrumentId,
    businessId: cert.businessId,
    applicationId: cert.applicationId,
    officerId: cert.officerId,
    gatcId: cert.gatcId,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    status: dynamicStatus,
    originalStatus: cert.status,
    isCurrent,
    issuedByType: authorityType,
    authority: authorityName,
    authorityType,
    gatcName: cert.gatcName || cert.gatc?.name || null,
    qrCodeData: cert.qrCodeData,
    digitalSignature: cert.digitalSignature,
    revocationReason: cert.revocationReason,
    revokedAt: cert.revokedAt,
    application: cert.application ? {
      id: cert.application.id,
      applicationNumber: cert.application.applicationNumber,
      applicationType: cert.application.applicationType,
      createdAt: cert.application.createdAt,
      verification: cert.application.verification ? {
        id: cert.application.verification.id,
        verificationDate: cert.application.verification.verificationDate,
        overallResult: cert.application.verification.overallResult,
        measurementsCount: cert.application.verification.measurements?.length || 0,
      } : null,
    } : null,
    instrument: cert.instrument ? {
      id: cert.instrument.id,
      customId: cert.instrument.customId,
      name: cert.instrument.instrumentType?.name || 'Measuring Instrument',
      typeCode: cert.instrument.instrumentType?.code || 'UNKNOWN',
      manufacturer: cert.instrument.manufacturer,
      model: cert.instrument.model,
      serialNumber: cert.instrument.serialNumber,
      capacity: `${cert.instrument.capacity} ${cert.instrument.capacityUnit || 'kg'}`,
      accuracyClass: cert.instrument.accuracyClass,
      installationLocation: cert.instrument.installationLocation,
      currentCertificateId: cert.instrument.currentCertificateId,
    } : null,
    business: cert.business ? {
      id: cert.business.id,
      name: cert.business.businessName,
      ownerName: cert.business.ownerName,
      city: cert.business.city,
      district: cert.business.district,
      state: cert.business.state,
      address: `${cert.business.address}, ${cert.business.city}, ${cert.business.district}, ${cert.business.state} - ${cert.business.pincode}`,
    } : null,
    officer: cert.officer ? {
      id: cert.officer.id,
      name: cert.officer.name,
      code: cert.officer.officerCode,
      designation: cert.officer.designation,
      district: cert.officer.district,
    } : null,
    gatc: cert.gatc ? {
      id: cert.gatc.id,
      name: cert.gatc.name,
      code: cert.gatc.gatcCode,
      authorizationNo: cert.gatc.authorizationNo,
    } : null,
  };
}

/**
 * List Certificates with Search, Filters, RBAC, and Pagination
 */
async function listCertificates(req, res, next) {
  try {
    const {
      status,
      district,
      instrumentType,
      verificationType,
      authority,
      instrumentId,
      search,
      page,
      limit,
    } = req.query;

    const where = {};

    // RBAC Scoping
    if (req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (!business) return res.json({ success: true, data: { certificates: [], total: 0 } });
      where.businessId = business.id;
    } else if (req.user.role === 'OFFICER' && req.query.assignedToMe === 'true') {
      const officer = await prisma.officer.findUnique({ where: { userId: req.user.id } });
      if (officer) {
        where.officerId = officer.id;
      }
    }

    if (instrumentId) {
      where.instrumentId = instrumentId;
    }

    if (district && district !== 'ALL') {
      where.business = { ...(where.business || {}), district };
    }

    if (instrumentType && instrumentType !== 'ALL') {
      where.instrument = {
        ...(where.instrument || {}),
        instrumentType: { code: instrumentType },
      };
    }

    if (verificationType && verificationType !== 'ALL') {
      where.application = {
        ...(where.application || {}),
        applicationType: verificationType,
      };
    }

    if (authority && authority !== 'ALL') {
      if (authority === 'LMO') {
        where.OR = [
          { issuedByType: 'LMO' },
          { officerId: { not: null } },
        ];
      } else if (authority === 'GATC') {
        where.issuedByType = 'GATC';
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { certificateNumber: { contains: s } },
        { instrument: { customId: { contains: s } } },
        { instrument: { serialNumber: { contains: s } } },
        { instrument: { manufacturer: { contains: s } } },
        { instrument: { model: { contains: s } } },
        { business: { businessName: { contains: s } } },
        { business: { ownerName: { contains: s } } },
        { application: { applicationNumber: { contains: s } } },
        { gatcName: { contains: s } },
      ];
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        instrument: { include: { instrumentType: true } },
        business: true,
        officer: true,
        gatc: true,
        application: {
          include: {
            verification: {
              include: { measurements: true },
            },
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    let formatted = certificates.map(formatCertificate);

    // Filter by dynamic status if specified
    if (status && status !== 'ALL') {
      const filterKey = status.toUpperCase();
      formatted = formatted.filter((c) => {
        if (filterKey === 'CURRENT' || filterKey === 'ACTIVE' || filterKey === 'VALID') {
          return c.isCurrent && (c.status === 'VALID' || c.status === 'EXPIRING_SOON');
        }
        if (filterKey === 'HISTORICAL' || filterKey === 'SUPERSEDED') {
          return c.status === 'SUPERSEDED' || (!c.isCurrent && c.status !== 'REVOKED');
        }
        return c.status === filterKey;
      });
    }

    const total = formatted.length;
    let paginated = formatted;

    if (page && limit && limit !== 'ALL') {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const skip = (pageNum - 1) * limitNum;
      paginated = formatted.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        data: {
          certificates: paginated,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        certificates: paginated,
        total,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single certificate by ID or Certificate Number
 */
async function getCertificateById(req, res, next) {
  try {
    const { id } = req.params;

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateNumber: id }],
      },
      include: {
        instrument: { include: { instrumentType: true } },
        business: true,
        officer: true,
        gatc: true,
        application: {
          include: {
            verification: {
              include: {
                measurements: { orderBy: { testNumber: 'asc' } },
                evidence: true,
              },
            },
          },
        },
      },
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
        errorCode: 'CERTIFICATE_NOT_FOUND',
      });
    }

    // Role security check
    if (req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (!business || business.id !== cert.businessId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this certificate.',
          errorCode: 'FORBIDDEN',
        });
      }
    }

    const formatted = formatCertificate(cert);

    res.json({
      success: true,
      data: {
        certificate: {
          ...cert,
          ...formatted,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Certificate History for a given Certificate ID (Finds all certificates for the parent instrument)
 */
async function getCertificateHistory(req, res, next) {
  try {
    const { id } = req.params;

    const baseCert = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateNumber: id }],
      },
      include: { instrument: true, business: true },
    });

    if (!baseCert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate record not found.',
        errorCode: 'CERTIFICATE_NOT_FOUND',
      });
    }

    if (req.user.role === 'BUSINESS_OWNER' && baseCert.business.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        errorCode: 'FORBIDDEN',
      });
    }

    return fetchInstrumentHistoryData(baseCert.instrumentId, res, next, baseCert.id);
  } catch (err) {
    next(err);
  }
}

/**
 * Get Certificate History directly by Instrument ID
 */
async function getInstrumentCertificateHistory(req, res, next) {
  try {
    const { instrumentId, id } = req.params;
    const targetId = instrumentId || id;

    const instrument = await prisma.instrument.findFirst({
      where: {
        OR: [{ id: targetId }, { customId: targetId }],
      },
      include: { business: true },
    });

    if (!instrument) {
      return res.status(404).json({
        success: false,
        message: 'Instrument not found.',
        errorCode: 'INSTRUMENT_NOT_FOUND',
      });
    }

    if (req.user.role === 'BUSINESS_OWNER' && instrument.business.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        errorCode: 'FORBIDDEN',
      });
    }

    return fetchInstrumentHistoryData(instrument.id, res, next);
  } catch (err) {
    next(err);
  }
}

/**
 * Get Certificate History for an Application
 */
async function getApplicationCertificateHistory(req, res, next) {
  try {
    const { id } = req.params;

    const app = await prisma.verificationApplication.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }],
      },
      include: { business: true, certificate: true },
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    if (req.user.role === 'BUSINESS_OWNER' && app.business.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        errorCode: 'FORBIDDEN',
      });
    }

    return fetchInstrumentHistoryData(app.instrumentId, res, next, app.certificate?.id);
  } catch (err) {
    next(err);
  }
}

/**
 * Helper to fetch and build rich certificate history for an instrument
 */
async function fetchInstrumentHistoryData(instrumentId, res, next, highlightedCertId = null) {
  try {
    const instrument = await prisma.instrument.findUnique({
      where: { id: instrumentId },
      include: {
        instrumentType: true,
        business: true,
        applications: {
          include: {
            verification: { include: { measurements: true } },
            assignment: { include: { officer: true } },
            certificate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        certificates: {
          include: {
            officer: true,
            gatc: true,
            application: {
              include: {
                verification: { include: { measurements: true } },
              },
            },
          },
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!instrument) {
      return res.status(404).json({
        success: false,
        message: 'Instrument not found.',
        errorCode: 'INSTRUMENT_NOT_FOUND',
      });
    }

    // Attach instrument reference to each cert so formatCertificate can read currentCertificateId
    const formattedCerts = instrument.certificates.map((cert) => {
      return formatCertificate({
        ...cert,
        instrument: {
          ...instrument,
          currentCertificateId: instrument.currentCertificateId,
        },
        business: instrument.business,
      });
    });

    // Determine current active certificate and historical certificates
    const currentCertificate = formattedCerts.find((c) => c.isCurrent) || (formattedCerts.length > 0 ? formattedCerts[0] : null);
    const historicalCertificates = formattedCerts.filter((c) => c.id !== currentCertificate?.id);

    // Build Chronological Lifecycle Timeline
    const timeline = [];

    // 1. Instrument Registration Event
    timeline.push({
      id: `reg-${instrument.id}`,
      type: 'REGISTRATION',
      title: 'Instrument Registered',
      description: `${instrument.manufacturer} ${instrument.model} (${instrument.instrumentType?.name}) registered at ${instrument.installationLocation}.`,
      date: instrument.createdAt,
      status: 'COMPLETED',
      badge: 'Registered',
    });

    // 2. Application & Verification & Certificate issuance events
    for (const app of instrument.applications) {
      timeline.push({
        id: `app-${app.id}`,
        type: 'APPLICATION',
        title: `Verification Application: ${app.applicationNumber}`,
        description: `${app.applicationType} requested for ${instrument.customId}.`,
        date: app.createdAt,
        status: app.status,
        badge: app.applicationType,
      });

      if (app.verification) {
        timeline.push({
          id: `verif-${app.verification.id}`,
          type: 'VERIFICATION',
          title: `Field Inspection: ${app.verification.overallResult}`,
          description: `Testing completed with ${app.verification.measurements?.length || 0} standard test weights. Overall result: ${app.verification.overallResult}.`,
          date: app.verification.verificationDate,
          status: app.verification.overallResult === 'PASS' ? 'SUCCESS' : 'DANGER',
          badge: app.verification.overallResult,
        });
      }

      if (app.certificate) {
        const certMatch = formattedCerts.find((c) => c.id === app.certificate.id);
        const isCurrentCert = certMatch?.isCurrent;
        timeline.push({
          id: `cert-${app.certificate.id}`,
          type: 'CERTIFICATE_ISSUED',
          title: `Certificate Issued: ${app.certificate.certificateNumber}`,
          description: `Valid from ${new Date(app.certificate.issueDate).toLocaleDateString()} until ${new Date(app.certificate.expiryDate).toLocaleDateString()}. Authority: ${certMatch?.authority || 'Legal Metrology'}.`,
          date: app.certificate.issueDate,
          status: isCurrentCert ? 'ACTIVE' : certMatch?.status || 'HISTORICAL',
          badge: isCurrentCert ? 'CURRENT ACTIVE' : 'HISTORICAL',
          certificateNumber: app.certificate.certificateNumber,
          certificateId: app.certificate.id,
        });
      }
    }

    // Sort timeline descending by date
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Fetch audit logs related to this instrument and its certificates
    const certIds = formattedCerts.map((c) => c.id);
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: instrument.id },
          { entityId: { in: certIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: {
        instrument: {
          id: instrument.id,
          customId: instrument.customId,
          type: instrument.instrumentType?.name,
          typeCode: instrument.instrumentType?.code,
          manufacturer: instrument.manufacturer,
          model: instrument.model,
          serialNumber: instrument.serialNumber,
          capacity: `${instrument.capacity} ${instrument.capacityUnit || 'kg'}`,
          accuracyClass: instrument.accuracyClass,
          installationLocation: instrument.installationLocation,
          status: instrument.status,
          currentCertificateId: instrument.currentCertificateId,
          business: {
            id: instrument.business?.id,
            name: instrument.business?.businessName,
            ownerName: instrument.business?.ownerName,
            district: instrument.business?.district,
            city: instrument.business?.city,
          },
        },
        currentCertificate,
        historicalCertificates,
        certificates: formattedCerts,
        totalCertificates: formattedCerts.length,
        highlightedCertId,
        timeline,
        auditTrail: auditLogs,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Revoke Certificate (Officer/Admin)
 */
async function revokeCertificate(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Revocation reason is required.',
        errorCode: 'REASON_REQUIRED',
      });
    }

    const cert = await prisma.certificate.findFirst({
      where: { OR: [{ id }, { certificateNumber: id }] },
      include: { business: true, instrument: true },
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
        errorCode: 'NOT_FOUND',
      });
    }

    const updated = await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revocationReason: reason.trim(),
      },
    });

    // If revoked cert was current, update instrument status
    if (cert.instrument?.currentCertificateId === cert.id) {
      await prisma.instrument.update({
        where: { id: cert.instrumentId },
        data: {
          status: 'PENDING_VERIFICATION',
        },
      });
    }

    await createNotification({
      userId: cert.business.userId,
      title: `Certificate Revoked: ${cert.certificateNumber}`,
      message: `Your verification certificate was revoked: ${reason.trim()}`,
      type: 'DANGER',
      link: '/business/certificates',
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'CERTIFICATE_REVOKED',
      entity: 'Certificate',
      entityId: cert.id,
      description: `Certificate ${cert.certificateNumber} revoked. Reason: ${reason.trim()}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Certificate ${cert.certificateNumber} revoked successfully.`,
      data: { certificate: updated },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCertificates,
  getCertificateById,
  getCertificateHistory,
  getInstrumentCertificateHistory,
  getApplicationCertificateHistory,
  revokeCertificate,
};
