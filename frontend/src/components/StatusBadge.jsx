import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, FileCheck, ShieldAlert } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const clean = status.toUpperCase().replace(/\s+/g, '_');

  let icon = <Clock size={12} />;
  let label = status;
  let className = 'badge-pending';

  switch (clean) {
    case 'VALID':
    case 'APPROVED':
    case 'PASS':
    case 'ACTIVE':
    case 'CERTIFICATE_ISSUED':
      icon = <CheckCircle size={12} />;
      className = 'badge-valid';
      label = clean === 'CERTIFICATE_ISSUED' ? 'Certified' : status;
      break;

    case 'EXPIRING_SOON':
    case 'SCHEDULED':
    case 'ASSIGNED':
    case 'WARNING':
      icon = <AlertTriangle size={12} />;
      className = 'badge-expiring_soon';
      label = clean === 'EXPIRING_SOON' ? 'Expiring Soon' : status;
      break;

    case 'EXPIRED':
    case 'REJECTED':
    case 'FAIL':
    case 'REVOKED':
    case 'INACTIVE':
      icon = clean === 'REVOKED' ? <ShieldAlert size={12} /> : <XCircle size={12} />;
      className = 'badge-expired';
      break;

    case 'FIELD_VERIFICATION':
    case 'OFFICER_REVIEW':
      icon = <FileCheck size={12} />;
      className = 'badge-field_verification';
      label = clean === 'FIELD_VERIFICATION' ? 'In Field Inspection' : 'Officer Review';
      break;

    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    default:
      icon = <Clock size={12} />;
      className = 'badge-submitted';
      break;
  }

  return (
    <span className={`badge ${className} ${size === 'lg' ? 'badge-lg' : ''}`} title={`Status: ${label}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
