/**
 * Legal Metrology Status & Identifier Utilities
 */

function getDynamicCertificateStatus(cert) {
  if (!cert) return 'INVALID';
  if (cert.revokedAt || cert.status === 'REVOKED') return 'REVOKED';

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
  SUBMITTED: ['UNDER_REVIEW', 'ASSIGNED', 'REJECTED'],
  UNDER_REVIEW: ['ASSIGNED', 'SCHEDULED', 'REJECTED'],
  ASSIGNED: ['SCHEDULED', 'FIELD_VERIFICATION', 'REJECTED'],
  SCHEDULED: ['FIELD_VERIFICATION', 'ASSIGNED', 'REJECTED'],
  FIELD_VERIFICATION: ['OFFICER_REVIEW', 'FIELD_VERIFICATION'],
  OFFICER_REVIEW: ['APPROVED', 'REJECTED', 'FIELD_VERIFICATION'],
  APPROVED: ['CERTIFICATE_ISSUED'],
  CERTIFICATE_ISSUED: ['EXPIRED', 'REVOKED'],
  REJECTED: ['UNDER_REVIEW'], // Allow re-review if appeal or re-test
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
