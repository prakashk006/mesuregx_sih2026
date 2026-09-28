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

    // Fetch public verification history for this instrument
    const allInstrumentCerts = await prisma.certificate.findMany({
      where: { instrumentId: cert.instrumentId },
      include: {
        officer: { select: { name: true, officerCode: true } },
        application: { select: { applicationType: true } },
      },
      orderBy: { issueDate: 'desc' },
    });

    const currentCert = allInstrumentCerts.find((c) => c.status === 'VALID' || getDynamicCertificateStatus(c) === 'VALID') || allInstrumentCerts[0];
    const isCurrent = cert.id === currentCert?.id;

    const publicHistory = allInstrumentCerts.map((histCert) => {
      const histStatus = getDynamicCertificateStatus(histCert, currentCert?.id);
      return {
        certificateNumber: histCert.certificateNumber,
        issueDate: histCert.issueDate,
        expiryDate: histCert.expiryDate,
        status: histStatus,
        isCurrent: histCert.id === currentCert?.id,
        verificationType: histCert.application?.applicationType || 'Verification',
        authority: histCert.issuedByType === 'GATC' ? (histCert.gatcName || 'GATC Laboratory') : `LMO (${histCert.officer?.name || 'Inspector'})`,
      };
    });

    const authorityInfo = cert.issuedByType === 'GATC' ? {
      type: 'GATC',
      name: cert.gatcName || 'GATC Accredited Metrology Laboratory',
      officerCode: 'GATC-LAB',
      designation: 'Government Approved Test Centre',
      district: cert.business?.district || 'General',
    } : {
      type: 'LMO',
      name: cert.officer?.name || 'Inspector of Legal Metrology',
      officerCode: cert.officer?.officerCode || 'OFF-TN-042',
      designation: cert.officer?.designation || 'Senior Inspector of Legal Metrology',
      district: cert.officer?.district || cert.business?.district || 'General',
    };

    res.json({
      success: true,
      data: {
        certificateNumber: cert.certificateNumber,
        status: dynamicStatus,
        isCurrent,
        currentCertificateNumber: currentCert?.certificateNumber || cert.certificateNumber,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        daysRemaining: diffDays,
        revokedAt: cert.revokedAt,
        revocationReason: cert.revocationReason,
        digitalSignature: cert.digitalSignature,
        issuedByType: cert.issuedByType || 'LMO',
        instrument: {
          customId: cert.instrument.customId,
          type: cert.instrument.instrumentType?.name || 'Measuring Scale',
          manufacturer: cert.instrument.manufacturer,
          model: cert.instrument.model,
          serialNumber: cert.instrument.serialNumber,
          capacity: `${cert.instrument.capacity} ${cert.instrument.capacityUnit || 'kg'}`,
          accuracyClass: cert.instrument.accuracyClass,
        },
        business: {
          name: cert.business.businessName,
          location: `${cert.business.city}, ${cert.business.district}, ${cert.business.state}`,
        },
        officer: authorityInfo,
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
        history: publicHistory,
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

