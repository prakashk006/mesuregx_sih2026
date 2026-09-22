const prisma = require('../config/prisma');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

// Process Demo Fee Payment
async function payDemo(req, res, next) {
  try {
    const { applicationId, amount = 350.0, paymentMethod = 'UPI_DEMO', feeType = 'Verification Fee' } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'applicationId is required for payment processing.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    // Resolve application by ID or applicationNumber
    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [{ id: applicationId }, { applicationNumber: applicationId }],
      },
      include: {
        business: true,
        instrument: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    // Check if already paid
    const existingPayment = await prisma.payment.findUnique({
      where: { applicationId: application.id },
    });

    if (existingPayment && existingPayment.status === 'PAID') {
      return res.json({
        success: true,
        message: 'Payment already recorded for this application.',
        data: { payment: existingPayment },
      });
    }

    const count = await prisma.payment.count();
    const seq = (count + 1).toString().padStart(6, '0');
    const paymentNumber = `PAY-2026-${seq}`;
    const receiptNumber = `REC-2026-${seq}`;
    const transactionRef = `TXN-DEMO-${Date.now().toString().slice(-8)}`;

    const payment = await prisma.payment.upsert({
      where: { applicationId: application.id },
      update: {
        amount: parseFloat(amount),
        feeType,
        paymentMethod,
        transactionRef,
        status: 'PAID',
        paidAt: new Date(),
      },
      create: {
        paymentNumber,
        receiptNumber,
        applicationId: application.id,
        businessId: application.businessId,
        amount: parseFloat(amount),
        feeType,
        paymentMethod,
        transactionRef,
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        application: {
          include: {
            instrument: { include: { instrumentType: true } },
          },
        },
        business: true,
      },
    });

    // Advance application status to UNDER_REVIEW if it was SUBMITTED or PAYMENT_PENDING
    if (['SUBMITTED', 'PAYMENT_PENDING', 'DRAFT'].includes(application.status)) {
      await prisma.verificationApplication.update({
        where: { id: application.id },
        data: { status: 'UNDER_REVIEW' },
      });
    }

    // Notify business
    await createNotification({
      userId: application.business.userId,
      title: `Payment Received: ₹${amount.toFixed(2)}`,
      message: `Fee payment verified for Application ${application.applicationNumber}. Receipt No: ${receiptNumber}. Application is now under review.`,
      type: 'SUCCESS',
      link: '/business/payments',
    });

    // Audit log
    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'PAYMENT_COMPLETED',
      entity: 'Payment',
      entityId: payment.id,
      description: `Payment ${paymentNumber} (₹${amount}) completed for ${application.applicationNumber}. Receipt: ${receiptNumber}.`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Demo fee payment processed successfully. Official receipt generated.',
      data: { payment },
    });
  } catch (err) {
    next(err);
  }
}

// List payments
async function listPayments(req, res, next) {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // Role-based boundary
    if (req.user.role === 'BUSINESS_OWNER') {
      const business = await prisma.business.findUnique({ where: { userId: req.user.id } });
      if (!business) {
        return res.json({ success: true, data: { payments: [], pagination: { total: 0, totalPages: 1 } } });
      }
      where.businessId = business.id;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { paymentNumber: { contains: search } },
        { receiptNumber: { contains: search } },
        { transactionRef: { contains: search } },
        { application: { applicationNumber: { contains: search } } },
      ];
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          application: {
            include: {
              instrument: { include: { instrumentType: true } },
            },
          },
          business: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
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

// Get payment by ID or receiptNumber
async function getPaymentById(req, res, next) {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id }, { paymentNumber: id }, { receiptNumber: id }],
      },
      include: {
        application: {
          include: {
            instrument: { include: { instrumentType: true } },
          },
        },
        business: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
        errorCode: 'PAYMENT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { payment },
    });
  } catch (err) {
    next(err);
  }
}

// Get payment for application
async function getPaymentByApplication(req, res, next) {
  try {
    const { applicationId } = req.params;

    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [{ id: applicationId }, { applicationNumber: applicationId }],
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { applicationId: application.id },
      include: {
        business: true,
        application: true,
      },
    });

    res.json({
      success: true,
      data: { payment },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  payDemo,
  listPayments,
  getPaymentById,
  getPaymentByApplication,
};
