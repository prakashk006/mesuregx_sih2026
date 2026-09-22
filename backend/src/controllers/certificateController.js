const prisma = require('../config/prisma');
const { getDynamicCertificateStatus } = require('../utils/statusHelper');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

async function listCertificates(req, res, next) {
  try {
    const { status, district, instrumentType, search } = req.query;
    const where = {};

    if (req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (!business) return res.json({ success: true, data: { certificates: [] } });
      where.businessId = business.id;
    }

    if (district && district !== 'ALL') {
      where.business = { district };
    }

    if (instrumentType && instrumentType !== 'ALL') {
      where.instrument = {
        instrumentType: { code: instrumentType },
      };
    }

    if (search) {
      where.OR = [
        { certificateNumber: { contains: search } },
        { instrument: { customId: { contains: search } } },
        { instrument: { serialNumber: { contains: search } } },
        { business: { businessName: { contains: search } } },
      ];
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        instrument: { include: { instrumentType: true } },
        business: true,
        officer: true,
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

    const formatted = certificates
      .map((cert) => {
        const dynamicStatus = getDynamicCertificateStatus(cert);
        return {
          id: cert.id,
          certificateNumber: cert.certificateNumber,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          status: dynamicStatus,
          originalStatus: cert.status,
          qrCodeData: cert.qrCodeData,
          digitalSignature: cert.digitalSignature,
          instrument: {
            id: cert.instrument.id,
            customId: cert.instrument.customId,
            name: cert.instrument.instrumentType.name,
            typeCode: cert.instrument.instrumentType.code,
            manufacturer: cert.instrument.manufacturer,
            model: cert.instrument.model,
            serialNumber: cert.instrument.serialNumber,
            capacity: `${cert.instrument.capacity} ${cert.instrument.capacityUnit}`,
            accuracyClass: cert.instrument.accuracyClass,
          },
          business: {
            id: cert.business.id,
            name: cert.business.businessName,
            ownerName: cert.business.ownerName,
            address: `${cert.business.address}, ${cert.business.city}, ${cert.business.district}, ${cert.business.state} - ${cert.business.pincode}`,
          },
          officer: {
            id: cert.officer.id,
            name: cert.officer.name,
            code: cert.officer.officerCode,
            designation: cert.officer.designation,
          },
        };
      })
      .filter((c) => {
        if (!status || status === 'ALL') return true;
        return c.status === status;
      });

    res.json({
      success: true,
      data: { certificates: formatted },
    });
  } catch (err) {
    next(err);
  }
}

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

    const dynamicStatus = getDynamicCertificateStatus(cert);

    res.json({
      success: true,
      data: {
        certificate: {
          ...cert,
          dynamicStatus,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function revokeCertificate(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
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
        revocationReason: reason,
      },
    });

    await prisma.instrument.update({
      where: { id: cert.instrumentId },
      data: { status: 'PENDING_VERIFICATION' },
    });

    await createNotification({
      userId: cert.business.userId,
      title: `Certificate Revoked: ${cert.certificateNumber}`,
      message: `Your verification certificate was revoked: ${reason}`,
      type: 'DANGER',
      link: '/business/certificates',
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'CERTIFICATE_REVOKED',
      entity: 'Certificate',
      entityId: cert.id,
      description: `Certificate ${cert.certificateNumber} revoked. Reason: ${reason}`,
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
  revokeCertificate,
};
