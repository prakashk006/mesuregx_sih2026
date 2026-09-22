const prisma = require('../config/prisma');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

// Create a Complaint (Public or Authenticated)
async function createComplaint(req, res, next) {
  try {
    const {
      reporterName,
      reporterEmail,
      reporterPhone,
      category = 'INCORRECT_MEASUREMENT',
      certificateNumber,
      instrumentId,
      description,
      evidenceUrl,
      location,
    } = req.body;

    if (!reporterName || !reporterEmail || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and description of the complaint are required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    let businessId = null;
    if (req.user && req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (business) businessId = business.id;
    }

    const count = await prisma.complaint.count();
    const seq = (count + 1).toString().padStart(6, '0');
    const complaintNumber = `CMP-2026-${seq}`;

    const complaint = await prisma.complaint.create({
      data: {
        complaintNumber,
        businessId,
        reporterName,
        reporterEmail,
        reporterPhone: reporterPhone || null,
        category,
        certificateNumber: certificateNumber || null,
        instrumentId: instrumentId || null,
        description,
        evidenceUrl: evidenceUrl || null,
        location: location || null,
        status: 'SUBMITTED',
      },
      include: {
        assignedOfficer: true,
      },
    });

    // Notify admins / officers
    const adminUsers = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of adminUsers) {
      await createNotification({
        userId: admin.id,
        title: `New Grievance Filed: ${complaintNumber}`,
        message: `A new ${category.replace('_', ' ')} complaint was submitted by ${reporterName}.`,
        type: 'WARNING',
        link: '/admin/complaints',
      });
    }

    // Audit log
    await logAudit({
      userId: req.user?.id || null,
      userRole: req.user?.role || 'PUBLIC',
      action: 'COMPLAINT_CREATED',
      entity: 'Complaint',
      entityId: complaint.id,
      description: `Public/Business grievance ${complaintNumber} created for category: ${category}.`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully. An investigation reference has been generated.',
      data: { complaint },
    });
  } catch (err) {
    next(err);
  }
}

// List Complaints
async function listComplaints(req, res, next) {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (business) {
        where.OR = [{ businessId: business.id }, { reporterEmail: req.user.email }];
      } else {
        where.reporterEmail = req.user.email;
      }
    } else if (req.user.role === 'OFFICER') {
      const officer = await prisma.officer.findUnique({ where: { userId: req.user.id } });
      if (officer) {
        // Show assigned or unassigned
        where.OR = [{ officerId: officer.id }, { officerId: null }];
      }
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { complaintNumber: { contains: search } },
        { reporterName: { contains: search } },
        { certificateNumber: { contains: search } },
        { instrumentId: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedOfficer: true,
          business: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        complaints,
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

// Get complaint details
async function getComplaintById(req, res, next) {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id }, { complaintNumber: id }],
      },
      include: {
        assignedOfficer: true,
        business: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.',
        errorCode: 'COMPLAINT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { complaint },
    });
  } catch (err) {
    next(err);
  }
}

// Update status / Officer assignment / resolution
async function updateComplaintStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, officerId, officerNotes, resolutionSummary } = req.body;

    const existing = await prisma.complaint.findFirst({
      where: {
        OR: [{ id }, { complaintNumber: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
        errorCode: 'COMPLAINT_NOT_FOUND',
      });
    }

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (officerId !== undefined) dataToUpdate.officerId = officerId;
    if (officerNotes !== undefined) dataToUpdate.officerNotes = officerNotes;
    if (resolutionSummary !== undefined) dataToUpdate.resolutionSummary = resolutionSummary;

    const updated = await prisma.complaint.update({
      where: { id: existing.id },
      data: dataToUpdate,
      include: {
        assignedOfficer: true,
        business: true,
      },
    });

    // Audit log
    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'COMPLAINT_UPDATED',
      entity: 'Complaint',
      entityId: existing.id,
      description: `Grievance ${existing.complaintNumber} status changed to ${status || existing.status}.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Grievance ${existing.complaintNumber} updated successfully.`,
      data: { complaint: updated },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createComplaint,
  listComplaints,
  getComplaintById,
  updateComplaintStatus,
};
