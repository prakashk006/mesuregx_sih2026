/**
 * Legal Metrology Status & Identifier Utilities
 */

function getDynamicCertificateStatus(cert, currentCertificateId) {
  if (!cert) return 'INVALID';
  if (cert.revokedAt || cert.status === 'REVOKED') return 'REVOKED';
  if (cert.status === 'SUPERSEDED') return 'SUPERSEDED';

  // Check if superseded by newer current certificate on instrument
  const activeCurrentCertId = currentCertificateId || cert.instrument?.currentCertificateId;
  if (activeCurrentCertId && cert.id !== activeCurrentCertId) {
    // If the instrument has an active current certificate and this is an older one
    if (cert.status !== 'EXPIRED') {
      return 'SUPERSEDED';
    }
  }

  const now = new Date();
  const expiry = new Date(cert.expiryDate);

  if (now > expiry) {
    return 'EXPIRED';
  }

  const msIn30Days = 30 * 24 * 60 * 60 * 1000;
  if (expiry.getTime() - now.getTime() <= msIn30Days) {
    return 'EXPIRING_SOON';
  }

  return 'VALID';
}


const ALLOWED_TRANSITIONS = {
  SUBMITTED: ['PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'UNDER_REVIEW', 'ASSIGNED', 'GATC_ASSIGNED', 'NEEDS_CORRECTION', 'REJECTED'],
  PAYMENT_PENDING: ['PAYMENT_COMPLETED', 'CANCELLED'],
  PAYMENT_COMPLETED: ['SCHEDULE_PENDING', 'ASSIGNED', 'GATC_ASSIGNED', 'UNDER_REVIEW'],
  SCHEDULE_PENDING: ['SCHEDULED', 'ASSIGNED', 'GATC_ASSIGNED'],
  UNDER_REVIEW: ['ASSIGNED', 'GATC_ASSIGNED', 'SCHEDULED', 'NEEDS_CORRECTION', 'REJECTED'],
  NEEDS_CORRECTION: ['RESUBMITTED', 'CANCELLED'],
  RESUBMITTED: ['UNDER_REVIEW', 'ASSIGNED', 'GATC_ASSIGNED'],
  ASSIGNED: ['SCHEDULED', 'FIELD_VERIFICATION', 'REJECTED', 'NEEDS_CORRECTION'],
  GATC_ASSIGNED: ['SCHEDULED', 'FIELD_VERIFICATION', 'REJECTED', 'NEEDS_CORRECTION'],
  SCHEDULED: ['FIELD_VERIFICATION', 'ASSIGNED', 'GATC_ASSIGNED', 'REJECTED'],
  FIELD_VERIFICATION: ['OFFICER_REVIEW', 'STAMP_APPLIED', 'REPAIR_REQUIRED', 'FIELD_VERIFICATION'],
  STAMP_APPLIED: ['APPROVED', 'CERTIFICATE_ISSUED'],
  REPAIR_REQUIRED: ['RE_VERIFICATION_PENDING'],
  RE_VERIFICATION_PENDING: ['SCHEDULED', 'FIELD_VERIFICATION', 'ASSIGNED'],
  OFFICER_REVIEW: ['STAMP_APPLIED', 'APPROVED', 'REJECTED', 'REPAIR_REQUIRED', 'FIELD_VERIFICATION', 'SCHEDULED'],
  APPROVED: ['CERTIFICATE_ISSUED'],
  CERTIFICATE_ISSUED: ['EXPIRED', 'REVOKED'],
  REJECTED: ['UNDER_REVIEW', 'SUBMITTED', 'REPAIR_REQUIRED'], // Allow re-review if appeal or re-test
  EXPIRED: ['SUBMITTED'], // Re-verification cycle
};

function isValidTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

function generateApplicationNumber(sequenceNumber) {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(6, '0');
  return `APP-${year}-${seq}`;
}

function generateCertificateNumber(sequenceNumber) {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(6, '0');
  return `CERT-${year}-${seq}`;
}

module.exports = {
  getDynamicCertificateStatus,
  isValidTransition,
  generateApplicationNumber,
  generateCertificateNumber,
};
