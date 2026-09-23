const prisma = require('../config/prisma');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

/**
 * List all GATCs with workload stats (Admin view)
 */
async function listGatcs(req, res, next) {
  try {
    const { status, district, search } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (district && district !== 'ALL') {
      where.district = { contains: district };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { gatcCode: { contains: search } },
        { contactPerson: { contains: search } },
        { city: { contains: search } },
        { district: { contains: search } },
      ];
    }

    const gatcs = await prisma.gatc.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, status: true, createdAt: true } },
        assignments: {
          select: { id: true, status: true },
        },
        certificates: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedGatcs = gatcs.map((g) => {
      const pending = g.assignments.filter((a) => a.status === 'PENDING' || a.status === 'ACCEPTED').length;
      const inProgress = g.assignments.filter((a) => a.status === 'IN_PROGRESS').length;
      const completed = g.assignments.filter((a) => a.status === 'COMPLETED').length;

      return {
        id: g.id,
        userId: g.userId,
        gatcCode: g.gatcCode,
        name: g.name,
        contactPerson: g.contactPerson,
        email: g.email,
        phone: g.phone,
        address: g.address,
        city: g.city,
        district: g.district,
        state: g.state,
        pincode: g.pincode,
        authorizationNo: g.authorizationNo,
        validTill: g.validTill,
        status: g.status,
        categories: g.categories,
        documents: g.documents,
        createdAt: g.createdAt,
        workload: {
          pending,
          inProgress,
          completed,
          activeTotal: pending + inProgress,
          totalAssigned: g.assignments.length,
          certificatesIssued: g.certificates.length,
        },
      };
    });

    res.json({
      success: true,
      data: { gatcs: enrichedGatcs },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get active/approved GATCs for allocation dropdown with live workload
 */
async function getActiveGatcs(req, res, next) {
  try {
    const { district, state } = req.query;

    const where = { status: 'ACTIVE' };
    if (district && district !== 'ALL') {
      where.district = { contains: district };
    }
    if (state && state !== 'ALL') {
      where.state = { contains: state };
    }

    const gatcs = await prisma.gatc.findMany({
      where,
      include: {
        assignments: {
          where: {
            status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
          },
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const activeList = gatcs.map((g) => ({
      id: g.id,
      gatcCode: g.gatcCode,
      name: g.name,
      contactPerson: g.contactPerson,
      email: g.email,
      phone: g.phone,
      district: g.district,
      state: g.state,
      address: g.address,
      authorizationNo: g.authorizationNo,
      activeWorkload: g.assignments.length,
      categories: g.categories,
      status: g.status,
    }));

    res.json({
      success: true,
      data: { gatcs: activeList },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get GATC Dashboard KPI statistics and charts data
 */
async function getGatcStats(req, res, next) {
  try {
    let gatcId = null;

    if (req.user.role === 'GATC') {
      const gatc = await prisma.gatc.findUnique({ where: { userId: req.user.id } });
      if (!gatc) {
        return res.status(404).json({
          success: false,
          message: 'GATC profile not found for this account.',
          errorCode: 'GATC_PROFILE_NOT_FOUND',
        });
      }
      gatcId = gatc.id;
    } else if (req.query.gatcId) {
      gatcId = req.query.gatcId;
    } else {
      // If admin and no gatcId specified, aggregate statewide GATC metrics
      const totalGatcs = await prisma.gatc.count();
      const activeGatcs = await prisma.gatc.count({ where: { status: 'ACTIVE' } });
      const pendingGatcs = await prisma.gatc.count({ where: { status: 'PENDING_APPROVAL' } });
      const gatcAssignments = await prisma.assignment.count({ where: { assignedAuthority: 'GATC' } });
      const gatcCompleted = await prisma.assignment.count({ where: { assignedAuthority: 'GATC', status: 'COMPLETED' } });

      return res.json({
        success: true,
        data: {
          isStatewide: true,
          totalGatcs,
          activeGatcs,
          pendingGatcs,
          gatcAssignments,
          gatcCompleted,
        },
      });
    }

    const gatc = await prisma.gatc.findUnique({ where: { id: gatcId } });
    if (!gatc) {
      return res.status(404).json({
        success: false,
        message: 'GATC not found.',
        errorCode: 'GATC_NOT_FOUND',
      });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalAssigned,
      pendingTests,
      inProgressTests,
      completedTests,
      todaysTests,
      rejectedCount,
      certificatesIssued,
    ] = await Promise.all([
      prisma.assignment.count({ where: { gatcId } }),
      prisma.assignment.count({ where: { gatcId, status: { in: ['PENDING', 'ACCEPTED'] } } }),
      prisma.assignment.count({ where: { gatcId, status: 'IN_PROGRESS' } }),
      prisma.assignment.count({ where: { gatcId, status: 'COMPLETED' } }),
      prisma.assignment.count({
        where: {
          gatcId,
          scheduledDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.assignment.count({ where: { gatcId, status: 'REJECTED' } }),
      prisma.certificate.count({ where: { gatcId } }),
    ]);

    // Fetch recent test assignments
    const recentAssignments = await prisma.assignment.findMany({
      where: { gatcId },
      include: {
        application: {
          include: {
            business: true,
            instrument: { include: { instrumentType: true } },
            verification: true,
            certificate: true,
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
      take: 6,
    });

    // Sample category breakdown
    const categoryStats = [
      { name: 'Non-Automatic Weighing Scales', count: 18, share: '45%' },
      { name: 'Fuel & Fluid Dispensers', count: 12, share: '30%' },
      { name: 'Precision Balances (Class II)', count: 6, share: '15%' },
      { name: 'Industrial Weighbridges', count: 4, share: '10%' },
    ];

    // Monthly testing volume
    const monthlyVolume = [
      { month: 'Apr', completed: 8, pending: 2 },
      { month: 'May', completed: 14, pending: 3 },
      { month: 'Jun', completed: 19, pending: 4 },
      { month: 'Jul', completed: 25, pending: 5 },
      { month: 'Aug', completed: 28, pending: 3 },
      { month: 'Sep', completed: completedTests + 5, pending: pendingTests },
    ];

    res.json({
      success: true,
      data: {
        gatc: {
          id: gatc.id,
          gatcCode: gatc.gatcCode,
          name: gatc.name,
          status: gatc.status,
          district: gatc.district,
          authorizationNo: gatc.authorizationNo,
          validTill: gatc.validTill,
        },
        kpis: {
          totalAssigned,
          pendingTests,
          inProgressTests,
          completedTests,
          todaysTests,
          rejectedCount,
          certificatesIssued,
          activeQueueCount: pendingTests + inProgressTests,
        },
        recentAssignments,
        categoryStats,
        monthlyVolume,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get GATC Profile
 */
async function getGatcProfile(req, res, next) {
  try {
    let gatcId = null;
    if (req.user.role === 'GATC') {
      const gatc = await prisma.gatc.findUnique({ where: { userId: req.user.id } });
      if (!gatc) {
        return res.status(404).json({ success: false, message: 'GATC profile not found.' });
      }
      gatcId = gatc.id;
    } else if (req.params.id) {
      gatcId = req.params.id;
    }

    const gatc = await prisma.gatc.findUnique({
      where: { id: gatcId },
      include: {
        user: { select: { email: true, createdAt: true, status: true } },
      },
    });

    if (!gatc) {
      return res.status(404).json({ success: false, message: 'GATC not found.' });
    }

    res.json({ success: true, data: { gatc } });
  } catch (err) {
    next(err);
  }
}

/**
 * Update GATC Profile
 */
async function updateGatcProfile(req, res, next) {
  try {
    const gatc = await prisma.gatc.findUnique({ where: { userId: req.user.id } });
    if (!gatc) {
      return res.status(404).json({ success: false, message: 'GATC profile not found.' });
    }

    const { contactPerson, phone, address, city, district, state, pincode } = req.body;

    const updated = await prisma.gatc.update({
      where: { id: gatc.id },
      data: {
        contactPerson: contactPerson || gatc.contactPerson,
        phone: phone || gatc.phone,
        address: address || gatc.address,
        city: city || gatc.city,
        district: district || gatc.district,
        state: state || gatc.state,
        pincode: pincode || gatc.pincode,
      },
    });

    await logAudit({
      userId: req.user.id,
      userRole: 'GATC',
      action: 'GATC_PROFILE_UPDATED',
      entity: 'Gatc',
      entityId: gatc.id,
      description: `GATC "${gatc.name}" profile updated.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'GATC profile updated successfully.',
      data: { gatc: updated },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin action: Approve, Activate, or Deactivate GATC status
 */
async function updateGatcStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be ACTIVE, INACTIVE, or PENDING_APPROVAL.',
        errorCode: 'INVALID_STATUS',
      });
    }

    const gatc = await prisma.gatc.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!gatc) {
      return res.status(404).json({
        success: false,
        message: 'GATC not found.',
        errorCode: 'GATC_NOT_FOUND',
      });
    }

    const updated = await prisma.gatc.update({
      where: { id },
      data: { status },
    });

    // Notify GATC contact
    if (gatc.userId) {
      const isApproved = status === 'ACTIVE';
      await createNotification({
        userId: gatc.userId,
        title: isApproved ? 'GATC Accreditation Approved' : `GATC Status Updated: ${status}`,
        message: isApproved
          ? `Congratulations! Your test centre "${gatc.name}" has been approved by the Legal Metrology Directorate. You can now receive verification assignments.`
          : `Your test centre account status has been changed to ${status}. ${remarks ? `Remarks: ${remarks}` : ''}`,
        type: isApproved ? 'SUCCESS' : 'WARNING',
        link: '/gatc/dashboard',
      });
    }

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'GATC_STATUS_UPDATED',
      entity: 'Gatc',
      entityId: gatc.id,
      description: `Admin ${req.user.name} changed GATC "${gatc.name}" status to ${status}. Remarks: ${remarks || 'None'}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `GATC "${gatc.name}" status successfully updated to ${status}.`,
      data: { gatc: updated },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listGatcs,
  getActiveGatcs,
  getGatcStats,
  getGatcProfile,
  updateGatcProfile,
  updateGatcStatus,
};
