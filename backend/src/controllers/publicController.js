const prisma = require('../config/prisma');
const { getDynamicCertificateStatus } = require('../utils/statusHelper');

async function verifyPublicCertificate(req, res, next) {
  try {
    const { certificateNumber } = req.params;

    if (!certificateNumber) {
      return res.status(400).json({
        success: false,
        message: 'Certificate number is required.',
        errorCode: 'CERTIFICATE_NUMBER_REQUIRED',
      });
    }

    const cert = await prisma.certificate.findUnique({
      where: { certificateNumber: certificateNumber.trim().toUpperCase() },
      include: {
        instrument: {
          include: { instrumentType: true },
        },
        business: {
          select: {
            businessName: true,
            city: true,
            district: true,
            state: true,
          },
        },
        officer: {
          select: {
            name: true,
            officerCode: true,
            designation: true,
            district: true,
          },
        },
        application: {
          select: {
            applicationNumber: true,
            applicationType: true,
            verification: {
              select: {
                overallResult: true,
                verificationDate: true,
                latitude: true,
                longitude: true,
                measurements: {
                  select: {
                    testNumber: true,
                    referenceValue: true,
                    observedValue: true,
                    result: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found. The certificate number is invalid or has not been issued.',
        errorCode: 'CERTIFICATE_NOT_FOUND',
      });
    }

    const dynamicStatus = getDynamicCertificateStatus(cert);

    // Calculate days remaining or days expired
    const now = new Date();
    const expiry = new Date(cert.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        certificateNumber: cert.certificateNumber,
        status: dynamicStatus,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        daysRemaining: diffDays,
        revokedAt: cert.revokedAt,
        revocationReason: cert.revocationReason,
        digitalSignature: cert.digitalSignature,
        instrument: {
          customId: cert.instrument.customId,
          type: cert.instrument.instrumentType.name,
          manufacturer: cert.instrument.manufacturer,
          model: cert.instrument.model,
          serialNumber: cert.instrument.serialNumber,
          capacity: `${cert.instrument.capacity} ${cert.instrument.capacityUnit}`,
          accuracyClass: cert.instrument.accuracyClass,
        },
        business: {
          name: cert.business.businessName,
          location: `${cert.business.city}, ${cert.business.district}, ${cert.business.state}`,
        },
        officer: {
          name: cert.officer.name,
          officerCode: cert.officer.officerCode,
          designation: cert.officer.designation,
          district: cert.officer.district,
        },
        verificationSummary: {
          result: cert.application?.verification?.overallResult || 'PASS',
          date: cert.application?.verification?.verificationDate || cert.issueDate,
          testsCount: cert.application?.verification?.measurements?.length || 0,
        },
        securityBadge: {
          isDigitallySigned: true,
          verificationSource: 'MESUREGX Public Metrology Ledger',
          complianceStandard: 'Legal Metrology Act 2009 & General Rules 2011',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getPublicStats(req, res, next) {
  try {
    const [instrumentsCount, certsCount, appsCount, verificationsCount] = await Promise.all([
      prisma.instrument.count(),
      prisma.certificate.count(),
      prisma.verificationApplication.count(),
      prisma.verification.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalInstruments: instrumentsCount,
        activeCertificates: certsCount,
        totalApplications: appsCount,
        verificationsCount: verificationsCount,
        statesCovered: 36,
        systemStatus: 'ONLINE',
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verifyPublicCertificate,
  getPublicStats,
};

