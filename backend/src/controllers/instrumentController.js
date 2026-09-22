const prisma = require('../config/prisma');
const { getDynamicCertificateStatus } = require('../utils/statusHelper');
const { logAudit } = require('../services/auditService');

async function listInstruments(req, res, next) {
  try {
    const { search, typeId, status } = req.query;
    const where = {};

    if (req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (!business) return res.json({ success: true, data: { instruments: [] } });
      where.businessId = business.id;
    }

    if (typeId) {
      where.typeId = typeId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customId: { contains: search } },
        { serialNumber: { contains: search } },
        { manufacturer: { contains: search } },
        { model: { contains: search } },
        { installationLocation: { contains: search } },
      ];
    }

    const instruments = await prisma.instrument.findMany({
      where,
      include: {
        instrumentType: true,
        business: {
          select: { id: true, businessName: true, district: true, city: true },
        },
        certificates: {
          orderBy: { issueDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = instruments.map((inst) => {
      const latestCert = inst.certificates[0] || null;
      const certStatus = latestCert ? getDynamicCertificateStatus(latestCert) : null;
      return {
        id: inst.id,
        customId: inst.customId,
        instrumentType: inst.instrumentType.name,
        typeCode: inst.instrumentType.code,
        typeId: inst.typeId,
        manufacturer: inst.manufacturer,
        model: inst.model,
        serialNumber: inst.serialNumber,
        capacity: inst.capacity,
        capacityUnit: inst.capacityUnit,
        accuracyClass: inst.accuracyClass,
        installationLocation: inst.installationLocation,
        purchaseDate: inst.purchaseDate,
        description: inst.description,
        status: inst.status,
        business: inst.business,
        latestCertificate: latestCert
          ? {
              id: latestCert.id,
              certificateNumber: latestCert.certificateNumber,
              issueDate: latestCert.issueDate,
              expiryDate: latestCert.expiryDate,
              status: certStatus,
            }
          : null,
      };
    });

    res.json({
      success: true,
      data: { instruments: formatted },
    });
  } catch (err) {
    next(err);
  }
}

async function createInstrument(req, res, next) {
  try {
    const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
    if (!business) {
      return res.status(400).json({
        success: false,
        message: 'No registered business associated with this account.',
        errorCode: 'BUSINESS_NOT_FOUND',
      });
    }

    const {
      typeId,
      customId,
      manufacturer,
      model,
      serialNumber,
      capacity,
      capacityUnit = 'kg',
      accuracyClass = 'III',
      purchaseDate,
      installationLocation,
      description,
    } = req.body;

    if (!typeId || !manufacturer || !model || !serialNumber || !capacity || !installationLocation) {
      return res.status(400).json({
        success: false,
        message: 'Type, manufacturer, model, serial number, capacity, and location are required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    // Auto-generate customId if not supplied
    let finalCustomId = customId ? customId.trim().toUpperCase() : null;
    if (!finalCustomId) {
      const totalCount = await prisma.instrument.count();
      const type = await prisma.instrumentType.findUnique({ where: { id: typeId } });
      const prefix = type?.code?.includes('FUEL') ? 'FD' : 'WX';
      finalCustomId = `${prefix}-${1000 + totalCount + 1}`;
    }

    // Check unique customId
    const exists = await prisma.instrument.findUnique({ where: { customId: finalCustomId } });
    if (exists) {
      finalCustomId = `${finalCustomId}-${Date.now().toString().slice(-4)}`;
    }

    const instrument = await prisma.instrument.create({
      data: {
        customId: finalCustomId,
        businessId: business.id,
        typeId,
        manufacturer,
        model,
        serialNumber,
        capacity: parseFloat(capacity),
        capacityUnit,
        accuracyClass,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        installationLocation,
        description,
        status: 'PENDING_VERIFICATION',
      },
      include: {
        instrumentType: true,
      },
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'INSTRUMENT_CREATED',
      entity: 'Instrument',
      entityId: instrument.id,
      description: `Instrument ${instrument.customId} (${instrument.manufacturer} ${instrument.model}) registered.`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Instrument ${instrument.customId} registered successfully.`,
      data: { instrument },
    });
  } catch (err) {
    next(err);
  }
}

async function getInstrumentById(req, res, next) {
  try {
    const { id } = req.params;
    const instrument = await prisma.instrument.findUnique({
      where: { id },
      include: {
        instrumentType: true,
        business: true,
        applications: {
          include: {
            assignment: { include: { officer: true } },
            verification: true,
            certificate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        certificates: {
          include: { officer: true },
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

    // Role check for business owner
    if (req.user.role === 'BUSINESS_OWNER' && instrument.business.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        errorCode: 'FORBIDDEN',
      });
    }

    const certificatesWithDynamicStatus = instrument.certificates.map((cert) => ({
      ...cert,
      dynamicStatus: getDynamicCertificateStatus(cert),
    }));

    res.json({
      success: true,
      data: {
        instrument: {
          ...instrument,
          certificates: certificatesWithDynamicStatus,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateInstrument(req, res, next) {
  try {
    const { id } = req.params;
    const instrument = await prisma.instrument.findUnique({
      where: { id },
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

    const {
      manufacturer,
      model,
      serialNumber,
      capacity,
      capacityUnit,
      accuracyClass,
      installationLocation,
      description,
      status,
    } = req.body;

    const updated = await prisma.instrument.update({
      where: { id },
      data: {
        manufacturer: manufacturer || instrument.manufacturer,
        model: model || instrument.model,
        serialNumber: serialNumber || instrument.serialNumber,
        capacity: capacity ? parseFloat(capacity) : instrument.capacity,
        capacityUnit: capacityUnit || instrument.capacityUnit,
        accuracyClass: accuracyClass || instrument.accuracyClass,
        installationLocation: installationLocation || instrument.installationLocation,
        description: description !== undefined ? description : instrument.description,
        status: (req.user.role === 'ADMIN' || req.user.role === 'OFFICER') && status ? status : instrument.status,
      },
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'INSTRUMENT_UPDATED',
      entity: 'Instrument',
      entityId: instrument.id,
      description: `Instrument ${instrument.customId} details updated.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Instrument updated successfully.',
      data: { instrument: updated },
    });
  } catch (err) {
    next(err);
  }
}

async function getInstrumentTypes(req, res, next) {
  try {
    const types = await prisma.instrumentType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({
      success: true,
      data: { types },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listInstruments,
  createInstrument,
  getInstrumentById,
  updateInstrument,
  getInstrumentTypes,
};
