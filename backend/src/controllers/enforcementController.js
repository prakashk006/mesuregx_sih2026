const prisma = require('../config/prisma');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

function generateCaseNumber(seq) {
  const year = new Date().getFullYear();
  return `ENF-${year}-${String(seq).padStart(6, '0')}`;
}

async function listCases(req, res, next) {
  try {
    const { status, priority, district, search } = req.query;
    const where = {};

    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;
    if (district && district !== 'ALL') where.district = district;

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { caseNumber: { contains: s } },
        { title: { contains: s } },
        { violationType: { contains: s } },
        { business: { businessName: { contains: s } } },
      ];
    }

    // Role scoping: Business only sees their own enforcement cases
    if (req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (business) {
        where.businessId = business.id;
      }
    }

    const cases = await prisma.enforcementCase.findMany({
      where,
      include: {
        business: true,
        actions: { orderBy: { actionDate: 'desc' } },
        evidence: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { cases },
    });
  } catch (err) {
    next(err);
  }
}

async function listBusinesses(req, res, next) {
  try {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        district: true,
        city: true,
        address: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { businessName: 'asc' },
    });
    res.json({ success: true, data: { businesses } });
  } catch (err) {
    next(err);
  }
}

async function getCaseById(req, res, next) {
  try {
    const { id } = req.params;
    const enfCase = await prisma.enforcementCase.findFirst({
      where: { OR: [{ id }, { caseNumber: id }] },
      include: {
        business: true,
        actions: { orderBy: { actionDate: 'desc' } },
        evidence: true,
      },
    });

    if (!enfCase) {
      return res.status(404).json({
        success: false,
        message: 'Enforcement case not found.',
        errorCode: 'CASE_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { case: enfCase },
    });
  } catch (err) {
    next(err);
  }
}

async function createCase(req, res, next) {
  try {
    const {
      title,
      businessId,
      violationType,
      priority = 'Medium',
      location,
      district,
      remarks,
      observations,
      initialActionDescription,
    } = req.body;

    if (!title || !businessId || !violationType) {
      return res.status(400).json({
        success: false,
        message: 'Title, business, and violation type are required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    const count = await prisma.enforcementCase.count();
    let caseNumber = generateCaseNumber(count + 1);
    while (await prisma.enforcementCase.findUnique({ where: { caseNumber } })) {
      caseNumber = generateCaseNumber(count + 2);
    }

    let officerId = null;
    let officerName = req.user.name;
    if (req.user.role === 'OFFICER') {
      const off = await prisma.officer.findUnique({ where: { userId: req.user.id } });
      officerId = off?.id;
      officerName = off?.name;
    }

    const newCase = await prisma.enforcementCase.create({
      data: {
        caseNumber,
        title,
        businessId,
        officerId,
        violationType,
        priority,
        status: 'OPEN',
        location,
        district,
        remarks,
        observations,
        actions: {
          create: {
            actionType: 'Case Registered',
            description: initialActionDescription || `Statutory investigation case opened: ${title}`,
            officerId,
            officerName,
            status: 'COMPLETED',
          },
        },
      },
      include: { business: true, actions: true },
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'ENFORCEMENT_CASE_CREATED',
      entity: 'EnforcementCase',
      entityId: newCase.id,
      description: `Enforcement case ${newCase.caseNumber} registered for "${newCase.business.businessName}".`,
      ipAddress: req.ip,
    });

    // Notify Business
    await createNotification({
      userId: newCase.business.userId,
      title: `Notice of Metrology Inquiry: ${newCase.caseNumber}`,
      message: `A legal metrology statutory inquiry (${violationType}) has been logged regarding your business establishment.`,
      type: 'WARNING',
      link: `/business/complaints`,
    });

    res.status(201).json({
      success: true,
      message: `Enforcement case ${newCase.caseNumber} successfully initiated.`,
      data: { case: newCase },
    });
  } catch (err) {
    next(err);
  }
}

async function addAction(req, res, next) {
  try {
    const { id } = req.params;
    const { actionType, description, nextStatus } = req.body;

    if (!actionType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Action type and description are required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    const enfCase = await prisma.enforcementCase.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!enfCase) {
      return res.status(404).json({ success: false, message: 'Case not found.', errorCode: 'NOT_FOUND' });
    }

    let officerId = null;
    let officerName = req.user.name;
    if (req.user.role === 'OFFICER') {
      const off = await prisma.officer.findUnique({ where: { userId: req.user.id } });
      officerId = off?.id;
      officerName = off?.name;
    }

    const action = await prisma.enforcementAction.create({
      data: {
        caseId: id,
        actionType,
        description,
        officerId,
        officerName,
        status: 'COMPLETED',
      },
    });

    // Optionally update status
    let updatedStatus = enfCase.status;
    if (nextStatus) {
      updatedStatus = nextStatus;
      await prisma.enforcementCase.update({
        where: { id },
        data: {
          status: nextStatus,
          resolutionDate: nextStatus === 'RESOLVED' || nextStatus === 'CLOSED' ? new Date() : undefined,
        },
      });
    }

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'ENFORCEMENT_ACTION_TAKEN',
      entity: 'EnforcementCase',
      entityId: id,
      description: `Action "${actionType}" taken on ${enfCase.caseNumber}: ${description}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Action recorded successfully.`,
      data: { action, status: updatedStatus },
    });
  } catch (err) {
    next(err);
  }
}

async function updateCaseStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.', errorCode: 'VALIDATION_FAILED' });
    }

    const updated = await prisma.enforcementCase.update({
      where: { id },
      data: {
        status,
        remarks: remarks || undefined,
        resolutionDate: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : undefined,
      },
      include: { business: true },
    });

    res.json({
      success: true,
      message: `Case status updated to ${status}.`,
      data: { case: updated },
    });
  } catch (err) {
    next(err);
  }
}

async function addEvidence(req, res, next) {
  try {
    const { id } = req.params;
    const { evidenceType = 'INSPECTION_PHOTO', fileName, filePath, notes, fileSize, mimeType } = req.body;

    if (!fileName || !filePath) {
      return res.status(400).json({
        success: false,
        message: 'File name and file path are required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    const ev = await prisma.enforcementEvidence.create({
      data: {
        caseId: id,
        evidenceType,
        fileName,
        filePath,
        notes: notes || null,
        fileSize: fileSize ? parseInt(fileSize, 10) : null,
        mimeType: mimeType || 'image/jpeg',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Evidence attached successfully.',
      data: { evidence: ev },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCases,
  listBusinesses,
  getCaseById,
  createCase,
  addAction,
  updateCaseStatus,
  addEvidence,
};
