const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { getDynamicCertificateStatus } = require('../utils/statusHelper');
const { logAudit } = require('../services/auditService');

async function getAdminDashboardStats(req, res, next) {
  try {
    const [
      totalBusinesses,
      totalInstruments,
      totalApplications,
      registeredOfficers,
      allCertificates,
      allApplications,
      allVerifications,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.instrument.count(),
      prisma.verificationApplication.count(),
      prisma.officer.count(),
      prisma.certificate.findMany({
        include: {
          instrument: { include: { instrumentType: true } },
          business: true,
        },
      }),
      prisma.verificationApplication.findMany({
        select: { status: true, createdAt: true },
      }),
      prisma.verification.findMany({
        select: { overallResult: true },
      }),
    ]);

    let activeCertificates = 0;
    let expiredCertificates = 0;
    let expiringSoonCertificates = 0;
    let revokedCertificates = 0;

    allCertificates.forEach((c) => {
      const status = getDynamicCertificateStatus(c);
      if (status === 'VALID') activeCertificates++;
      else if (status === 'EXPIRING_SOON') {
        activeCertificates++;
        expiringSoonCertificates++;
      } else if (status === 'EXPIRED') expiredCertificates++;
      else if (status === 'REVOKED') revokedCertificates++;
    });

    const verifiedInstruments = await prisma.instrument.count({
      where: { status: 'VERIFIED' },
    });

    // Verification results pass vs fail
    const totalVerifs = allVerifications.length;
    const passedVerifs = allVerifications.filter((v) => v.overallResult === 'PASS').length;
    const failedVerifs = allVerifications.filter((v) => v.overallResult === 'FAIL').length;
    const passRate = totalVerifs > 0 ? Math.round((passedVerifs / totalVerifs) * 100) : 0;

    // Status breakdown for donut chart
    const statusCounts = {};
    allApplications.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    const statusChart = [
      { name: 'Submitted', value: statusCounts['SUBMITTED'] || 0, color: '#3b82f6' },
      { name: 'Assigned / Scheduled', value: (statusCounts['ASSIGNED'] || 0) + (statusCounts['SCHEDULED'] || 0), color: '#f59e0b' },
      { name: 'Field Verification', value: (statusCounts['FIELD_VERIFICATION'] || 0) + (statusCounts['OFFICER_REVIEW'] || 0), color: '#8b5cf6' },
      { name: 'Certificates Issued', value: (statusCounts['CERTIFICATE_ISSUED'] || 0) + (statusCounts['APPROVED'] || 0), color: '#10b981' },
      { name: 'Rejected', value: statusCounts['REJECTED'] || 0, color: '#ef4444' },
    ];

    res.json({
      success: true,
      data: {
        stats: {
          totalBusinesses,
          totalInstruments,
          totalApplications,
          verifiedInstruments,
          activeCertificates,
          expiringSoonCertificates,
          expiredCertificates,
          revokedCertificates,
          registeredOfficers,
          passRate,
          passedVerifs,
          failedVerifs,
        },
        statusChart,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { role, status, search } = req.query;
    const where = {};

    if (role && role !== 'ALL') where.role = role;
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        business: { select: { businessName: true, district: true } },
        officer: { select: { officerCode: true, designation: true, district: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (err) {
    next(err);
  }
}

async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.', errorCode: 'NOT_FOUND' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account.', errorCode: 'SELF_DEACTIVATION' });
    }

    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await prisma.user.update({
      where: { id },
      data: { status: nextStatus },
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'USER_STATUS_TOGGLED',
      entity: 'User',
      entityId: user.id,
      description: `User ${user.email} status changed to ${nextStatus}.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User status changed to ${nextStatus}.`,
      data: { user: updated },
    });
  } catch (err) {
    next(err);
  }
}

async function listOfficers(req, res, next) {
  try {
    const officers = await prisma.officer.findMany({
      include: {
        user: { select: { status: true, createdAt: true } },
        _count: {
          select: {
            assignments: true,
            verifications: true,
            certificates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { officers },
    });
  } catch (err) {
    next(err);
  }
}

async function addOfficer(req, res, next) {
  try {
    const { name, email, phone, district, designation, badgeNumber, password } = req.body;

    if (!name || !email || !district) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and district are required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Account with this email already exists.',
        errorCode: 'EMAIL_EXISTS',
      });
    }

    const count = await prisma.officer.count();
    const officerCode = `OFF-${district.slice(0, 2).toUpperCase()}-${String(count + 1).padStart(3, '0')}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Officer@123', salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        phone: phone || null,
        passwordHash,
        role: 'OFFICER',
        status: 'ACTIVE',
        officer: {
          create: {
            officerCode,
            name,
            email: email.toLowerCase().trim(),
            phone: phone || '+91 98422 00000',
            district,
            designation: designation || 'Inspector of Legal Metrology',
            badgeNumber: badgeNumber || `LM-${officerCode}`,
            status: 'ACTIVE',
          },
        },
      },
      include: { officer: true },
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'OFFICER_CREATED',
      entity: 'Officer',
      entityId: user.officer.id,
      description: `New officer ${name} (${officerCode}) added for district ${district}.`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Officer ${name} (${officerCode}) added successfully.`,
      data: { officer: user.officer },
    });
  } catch (err) {
    next(err);
  }
}

async function listRules(req, res, next) {
  try {
    const rules = await prisma.verificationRule.findMany({
      include: { instrumentType: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { rules },
    });
  } catch (err) {
    next(err);
  }
}

async function createRule(req, res, next) {
  try {
    const {
      instrumentTypeId,
      accuracyClass = 'III',
      capacityMin = 0,
      capacityMax = 1000,
      allowedErrorPercent,
      allowedErrorAbsolute,
      validityMonths = 12,
    } = req.body;

    if (!instrumentTypeId) {
      return res.status(400).json({
        success: false,
        message: 'Instrument type is required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    const rule = await prisma.verificationRule.create({
      data: {
        instrumentTypeId,
        accuracyClass,
        capacityMin: parseFloat(capacityMin),
        capacityMax: parseFloat(capacityMax),
        allowedErrorPercent: allowedErrorPercent ? parseFloat(allowedErrorPercent) : null,
        allowedErrorAbsolute: allowedErrorAbsolute ? parseFloat(allowedErrorAbsolute) : null,
        validityMonths: parseInt(validityMonths, 10) || 12,
        isActive: true,
      },
      include: { instrumentType: true },
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'RULE_CREATED',
      entity: 'VerificationRule',
      entityId: rule.id,
      description: `Verification rule created for ${rule.instrumentType.name} (Class ${accuracyClass}).`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Verification rule created successfully.',
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
}

async function toggleRule(req, res, next) {
  try {
    const { id } = req.params;
    const rule = await prisma.verificationRule.findUnique({ where: { id } });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found.', errorCode: 'NOT_FOUND' });
    }

    const updated = await prisma.verificationRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });

    res.json({
      success: true,
      message: `Rule status updated to ${updated.isActive ? 'Active' : 'Inactive'}.`,
      data: { rule: updated },
    });
  } catch (err) {
    next(err);
  }
}

async function listAuditLogs(req, res, next) {
  try {
    const { action, entity, search, page = 1, limit = 30 } = req.query;
    const where = {};

    if (action && action !== 'ALL') where.action = action;
    if (entity && entity !== 'ALL') where.entity = entity;
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { action: { contains: search } },
        { entity: { contains: search } },
        { entityId: { contains: search } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
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

module.exports = {
  getAdminDashboardStats,
  listUsers,
  toggleUserStatus,
  listOfficers,
  addOfficer,
  listRules,
  createRule,
  toggleRule,
  listAuditLogs,
};
