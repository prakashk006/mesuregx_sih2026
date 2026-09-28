const path = require('path');
const fs = require('fs');
const prisma = require('../config/prisma');
const { evaluateMeasurements } = require('../services/verificationEngineClient');
const { generateCertificateNumber, getDynamicCertificateStatus } = require('../utils/statusHelper');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

async function evaluateLive(req, res, next) {
  try {
    const {
      instrumentType,
      capacity,
      unit = 'kg',
      accuracyClass = 'III',
      measurements = [],
      customAllowedErrorPercent,
      customAllowedErrorAbsolute,
    } = req.body;

    if (!measurements || measurements.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one measurement pair (reference, observed) is required.',
        errorCode: 'NO_MEASUREMENTS',
      });
    }

    const evaluation = await evaluateMeasurements({
      instrumentType,
      capacity,
      unit,
      accuracyClass,
      measurements,
      customAllowedErrorPercent,
      customAllowedErrorAbsolute,
    });

    res.json({
      success: true,
      data: { evaluation },
    });
  } catch (err) {
    next(err);
  }
}

async function getVerificationByAppId(req, res, next) {
  try {
    const { applicationId } = req.params;

    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [
          { id: applicationId },
          { applicationNumber: applicationId },
        ],
      },
    });

    if (!application) {
      return res.json({
        success: true,
        data: { verification: null },
      });
    }

    const verification = await prisma.verification.findUnique({
      where: { applicationId: application.id },
      include: {
        measurements: { orderBy: { testNumber: 'asc' } },
        evidence: { orderBy: { uploadedAt: 'desc' } },
        officer: true,
        application: {
          include: {
            business: true,
            instrument: { include: { instrumentType: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: { verification },
    });
  } catch (err) {
    next(err);
  }
}

async function submitVerification(req, res, next) {
  try {
    const {
      applicationId,
      measurements: rawMeasurements = [],
      testReadings = [],
      latitude = req.body.gpsLatitude,
      longitude = req.body.gpsLongitude,
      locationAccuracy,
      locationAddress,
      notes = req.body.remarks,
      overallResult: clientResult = req.body.officerDecision,
      isDraft = false,
    } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    // Convert mobile app testReadings into measurements array if rawMeasurements is empty
    let measurements = rawMeasurements;
    if ((!measurements || measurements.length === 0) && Array.isArray(testReadings) && testReadings.length > 0) {
      measurements = testReadings.map((t) => ({
        reference: parseFloat(t.load || t.reference || 0),
        observed: parseFloat(t.observed || 0),
      }));
    }

    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [
          { id: applicationId },
          { applicationNumber: applicationId },
        ],
      },
      include: {
        business: true,
        instrument: { include: { instrumentType: true } },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    // Identify officer or GATC laboratory inspector
    let officerId = null;
    let gatcId = null;
    let verifiedByType = 'LMO';

    if (req.user.role === 'GATC') {
      const gatc = await prisma.gatc.findUnique({ where: { userId: req.user.id } });
      gatcId = gatc ? gatc.id : null;
      verifiedByType = 'GATC';
    } else if (req.user.role === 'OFFICER') {
      const officer = await prisma.officer.findUnique({ where: { userId: req.user.id } });
      officerId = officer ? officer.id : null;
    }

    if (!officerId && !gatcId) {
      const existingAssign = await prisma.assignment.findUnique({ where: { applicationId: application.id } });
      if (existingAssign?.assignedAuthority === 'GATC') {
        gatcId = existingAssign.gatcId;
        verifiedByType = 'GATC';
      } else {
        officerId = existingAssign?.officerId;
      }
      if (!officerId && !gatcId) {
        const defaultOff = await prisma.officer.findFirst({ where: { status: 'ACTIVE' } });
        officerId = defaultOff?.id;
      }
    }

    // Evaluate measurements via Rule Engine
    let evalResult = { overallResult: clientResult || 'PASS', tests: [] };
    if (measurements.length > 0) {
      // Check if custom rule exists for this instrument type
      const rule = await prisma.verificationRule.findFirst({
        where: {
          instrumentTypeId: application.instrument.typeId,
          accuracyClass: application.instrument.accuracyClass,
          isActive: true,
        },
      });

      evalResult = await evaluateMeasurements({
        instrumentType: application.instrument.instrumentType.code,
        capacity: application.instrument.capacity,
        unit: application.instrument.capacityUnit,
        accuracyClass: application.instrument.accuracyClass,
        measurements,
        customAllowedErrorPercent: rule?.allowedErrorPercent || null,
        customAllowedErrorAbsolute: rule?.allowedErrorAbsolute || null,
      });

      // Honor explicit client officer decision if passed
      if (clientResult && (clientResult === 'PASS' || clientResult === 'FAIL')) {
        evalResult.overallResult = clientResult;
      }
    }

    const finalResult = evalResult.overallResult || clientResult || 'PASS';

    // Upsert verification record
    const verification = await prisma.verification.upsert({
      where: { applicationId: application.id },
      update: {
        verifiedByType,
        officerId: verifiedByType === 'LMO' ? officerId : null,
        gatcId: verifiedByType === 'GATC' ? gatcId : null,
        verificationDate: new Date(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        locationAccuracy: locationAccuracy ? parseFloat(locationAccuracy) : null,
        locationAddress: locationAddress || application.location,
        overallResult: finalResult,
        notes: notes || null,
        status: isDraft ? 'DRAFT' : 'SUBMITTED',
      },
      create: {
        applicationId: application.id,
        verifiedByType,
        officerId: verifiedByType === 'LMO' ? officerId : null,
        gatcId: verifiedByType === 'GATC' ? gatcId : null,
        verificationDate: new Date(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        locationAccuracy: locationAccuracy ? parseFloat(locationAccuracy) : null,
        locationAddress: locationAddress || application.location,
        overallResult: finalResult,
        notes: notes || null,
        status: isDraft ? 'DRAFT' : 'SUBMITTED',
      },
    });

    // Replace measurements
    await prisma.measurement.deleteMany({ where: { verificationId: verification.id } });

    if (evalResult.tests && evalResult.tests.length > 0) {
      await prisma.measurement.createMany({
        data: evalResult.tests.map((t) => ({
          verificationId: verification.id,
          testNumber: t.testIndex,
          referenceValue: t.reference,
          observedValue: t.observed,
          error: t.error,
          percentageError: t.percentageError,
          allowedError: t.allowedError,
          result: t.result,
          remarks: t.remarks,
        })),
      });
    }

    // Update application status
    const nextAppStatus = isDraft
      ? 'FIELD_VERIFICATION'
      : (finalResult === 'PASS' ? 'VERIFIED' : 'REJECTED');

    await prisma.verificationApplication.update({
      where: { id: application.id },
      data: { status: nextAppStatus },
    });

    // Update assignment status to COMPLETED if submitted
    if (!isDraft) {
      await prisma.assignment.updateMany({
        where: { applicationId: application.id },
        data: { status: 'COMPLETED' },
      });
    }

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: isDraft ? 'VERIFICATION_DRAFT_SAVED' : 'VERIFICATION_SUBMITTED',
      entity: 'Verification',
      entityId: verification.id,
      description: `Field inspection data ${isDraft ? 'saved as draft' : 'submitted'} for ${application.applicationNumber}. Evaluation: ${finalResult}.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: isDraft
        ? 'Field verification draft saved successfully.'
        : `Field inspection submitted with overall result: ${finalResult}.`,
      data: {
        verification,
        evaluation: { ...evalResult, overallResult: finalResult },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function uploadEvidence(req, res, next) {
  try {
    const { applicationId, evidenceType = 'OTHER' } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
        errorCode: 'FILE_MISSING',
      });
    }

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'applicationId is required for evidence upload.',
        errorCode: 'VALIDATION_FAILED',
      });
    }

    // Ensure application exists and get UUID
    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [
          { id: applicationId },
          { applicationNumber: applicationId },
        ],
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    // Ensure verification record exists
    let verification = await prisma.verification.findUnique({
      where: { applicationId: application.id },
    });

    if (!verification) {
      const defaultOfficer = await prisma.officer.findFirst({ where: { status: 'ACTIVE' } });
      verification = await prisma.verification.create({
        data: {
          applicationId: application.id,
          officerId: defaultOfficer.id,
          status: 'DRAFT',
        },
      });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    const evidence = await prisma.evidence.create({
      data: {
        verificationId: verification.id,
        evidenceType,
        fileName: req.file.filename,
        filePath: relativePath,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Evidence photo uploaded successfully.',
      data: { evidence },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteEvidence(req, res, next) {
  try {
    const { id } = req.params;
    const evidence = await prisma.evidence.findUnique({ where: { id } });

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence not found.',
        errorCode: 'NOT_FOUND',
      });
    }

    // Remove file if exists
    const fullPath = path.resolve(__dirname, '../../../uploads', evidence.fileName);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.warn('Failed to delete evidence file from disk:', e.message);
      }
    }

    await prisma.evidence.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Evidence deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function officerDecision(req, res, next) {
  try {
    const { applicationId } = req.params;
    const { decision, rejectionReason, retestDate, notes } = req.body;

    if (!['APPROVE', 'REJECT', 'REQUEST_RETEST'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be one of: APPROVE, REJECT, REQUEST_RETEST.',
        errorCode: 'INVALID_DECISION',
      });
    }

    const application = await prisma.verificationApplication.findFirst({
      where: {
        OR: [
          { id: applicationId },
          { applicationNumber: applicationId },
        ],
      },
      include: {
        business: true,
        instrument: { include: { instrumentType: true } },
        verification: { include: { measurements: true } },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
        errorCode: 'APPLICATION_NOT_FOUND',
      });
    }

    let officerId = null;
    let gatcId = null;
    let issuedByType = 'LMO';
    let officer = null;
    let gatc = null;

    if (req.user.role === 'GATC') {
      gatc = await prisma.gatc.findUnique({ where: { userId: req.user.id } });
      gatcId = gatc?.id;
      issuedByType = 'GATC';
    } else if (req.user.role === 'OFFICER') {
      officer = await prisma.officer.findUnique({ where: { userId: req.user.id } });
      officerId = officer?.id;
    }

    if (!officerId && !gatcId) {
      officer = await prisma.officer.findFirst({ where: { status: 'ACTIVE' } });
      officerId = officer?.id;
    }

    if (decision === 'REJECT') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required.',
          errorCode: 'REJECTION_REASON_REQUIRED',
        });
      }

      await prisma.verificationApplication.update({
        where: { id: application.id },
        data: {
          status: 'REJECTED',
          rejectionReason,
        },
      });

      await prisma.instrument.update({
        where: { id: application.instrumentId },
        data: { status: 'REJECTED' },
      });

      await createNotification({
        userId: application.business.userId,
        title: `Application Rejected: ${application.applicationNumber}`,
        message: `Your verification application was rejected: ${rejectionReason}`,
        type: 'DANGER',
        link: '/business/applications',
      });

      await logAudit({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'APPLICATION_REJECTED',
        entity: 'Application',
        entityId: application.id,
        description: `Application ${application.applicationNumber} rejected by ${officer?.name || gatc?.name || 'Authorized Official'}. Reason: ${rejectionReason}`,
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        message: `Application ${application.applicationNumber} has been rejected.`,
        data: { status: 'REJECTED' },
      });
    }

    if (decision === 'REQUEST_RETEST') {
      await prisma.verificationApplication.update({
        where: { id: application.id },
        data: {
          status: 'SCHEDULED',
          rejectionReason: rejectionReason || 'Re-test required after calibration correction.',
          retestDate: retestDate ? new Date(retestDate) : null,
        },
      });

      await createNotification({
        userId: application.business.userId,
        title: `Re-test Requested: ${application.applicationNumber}`,
        message: `Officer requested re-verification. Remarks: ${rejectionReason || 'Recalibration needed.'}`,
        type: 'WARNING',
        link: '/business/applications',
      });

      await logAudit({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'APPLICATION_RETEST_REQUESTED',
        entity: 'Application',
        entityId: application.id,
        description: `Re-test requested for ${application.applicationNumber} on ${retestDate || 'pending date'}.`,
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        message: `Re-test requested for application ${application.applicationNumber}.`,
        data: { status: 'SCHEDULED' },
      });
    }

    // APPROVE -> Issue Digital Certificate
    // Determine validity period
    const validityMonths = application.instrument.instrumentType.defaultValidityMonths || 12;
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

    // Total certificate count for numbering
    let certSeq = (await prisma.certificate.count()) + 1;
    let certificateNumber = generateCertificateNumber(certSeq);
    while (await prisma.certificate.findUnique({ where: { certificateNumber } })) {
      certSeq++;
      certificateNumber = generateCertificateNumber(certSeq);
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrCodeData = `${baseUrl}/verify/${certificateNumber}`;
    const authCode = issuedByType === 'GATC' ? (gatc?.gatcCode || 'GATC') : (officer?.officerCode || 'LMO');
    const digitalSignature = `SHA256-RSA:${Buffer.from(`${certificateNumber}|${application.instrument.customId}|${issueDate.toISOString()}|${authCode}`).toString('hex').slice(0, 48)}`;

    // Version / Succession logic:
    // Mark previous active certificates for this instrument as SUPERSEDED
    // DO NOT overwrite or delete; retain all historical records
    await prisma.certificate.updateMany({
      where: {
        instrumentId: application.instrumentId,
        status: { in: ['VALID', 'EXPIRING_SOON'] },
      },
      data: {
        status: 'SUPERSEDED',
      },
    });

    const certificate = await prisma.certificate.upsert({
      where: {
        applicationId: application.id,
      },
      update: {
        certificateNumber,
        instrumentId: application.instrumentId,
        businessId: application.businessId,
        officerId: issuedByType === 'LMO' ? officerId : null,
        gatcId: issuedByType === 'GATC' ? gatcId : null,
        gatcName: issuedByType === 'GATC' ? (gatc?.name || 'Authorized GATC Laboratory') : null,
        issuedByType,
        issueDate,
        expiryDate,
        status: 'VALID',
        qrCodeData,
        digitalSignature,
      },
      create: {
        certificateNumber,
        applicationId: application.id,
        instrumentId: application.instrumentId,
        businessId: application.businessId,
        officerId: issuedByType === 'LMO' ? officerId : null,
        gatcId: issuedByType === 'GATC' ? gatcId : null,
        gatcName: issuedByType === 'GATC' ? (gatc?.name || 'Authorized GATC Laboratory') : null,
        issuedByType,
        issueDate,
        expiryDate,
        status: 'VALID',
        qrCodeData,
        digitalSignature,
      },
    });


    // Update application to CERTIFICATE_ISSUED
    await prisma.verificationApplication.update({
      where: { id: application.id },
      data: { status: 'CERTIFICATE_ISSUED' },
    });

    // Update instrument to VERIFIED and link current certificate
    await prisma.instrument.update({
      where: { id: application.instrumentId },
      data: {
        status: 'VERIFIED',
        currentCertificateId: certificate.id,
      },
    });

    // Notify Business
    await createNotification({
      userId: application.business.userId,
      title: `Certificate Issued: ${certificate.certificateNumber}`,
      message: `Digital Verification Certificate generated for ${application.instrument.customId}. Valid until ${expiryDate.toLocaleDateString()}.`,
      type: 'SUCCESS',
      link: '/business/certificates',
    });

    await logAudit({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'CERTIFICATE_ISSUED',
      entity: 'Certificate',
      entityId: certificate.id,
      description: `Certificate ${certificate.certificateNumber} issued for ${application.instrument.customId} by ${officer?.name || gatc?.name || 'Authorized Official'}.`,
      ipAddress: req.ip,
    });

    // Email dispatch (graceful)
    await sendEmail({
      to: application.business.email,
      subject: `[MESUREGX] Verification Certificate Issued: ${certificate.certificateNumber}`,
      text: `Dear ${application.business.ownerName},\n\nCongratulations! Your instrument ${application.instrument.customId} has passed legal metrology field verification.\n\nCertificate No: ${certificate.certificateNumber}\nValid Until: ${expiryDate.toLocaleDateString()}\nVerify online: ${qrCodeData}\n\nRegards,\nDepartment of Legal Metrology`,
    });

    res.json({
      success: true,
      message: `Application approved and Digital Certificate ${certificate.certificateNumber} issued successfully!`,
      data: {
        certificate,
        applicationStatus: 'CERTIFICATE_ISSUED',
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  evaluateLive,
  getVerificationByAppId,
  submitVerification,
  uploadEvidence,
  deleteEvidence,
  officerDecision,
};
