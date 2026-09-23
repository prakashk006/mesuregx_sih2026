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
    case 'RESOLVED':
    case 'CLOSED':
      icon = <CheckCircle size={12} />;
      className = 'badge-valid';
      label = clean === 'CERTIFICATE_ISSUED' ? 'Certified' : clean === 'RESOLVED' ? 'Resolved' : clean === 'CLOSED' ? 'Closed' : status;
      break;

    case 'EXPIRING_SOON':
    case 'SCHEDULED':
    case 'ASSIGNED':
    case 'WARNING':
    case 'ACTION_PENDING':
    case 'NOTICE_ISSUED':
    case 'HIGH':
      icon = <AlertTriangle size={12} />;
      className = 'badge-expiring_soon';
      label = clean === 'EXPIRING_SOON' ? 'Expiring Soon' : clean === 'NOTICE_ISSUED' ? 'Notice Issued' : clean === 'ACTION_PENDING' ? 'Action Pending' : status;
      break;

    case 'EXPIRED':
    case 'REJECTED':
    case 'FAIL':
    case 'REVOKED':
    case 'INACTIVE':
    case 'VIOLATION_CONFIRMED':
    case 'CRITICAL':
      icon = clean === 'REVOKED' || clean === 'CRITICAL' ? <ShieldAlert size={12} /> : <XCircle size={12} />;
      className = 'badge-expired';
      label = clean === 'VIOLATION_CONFIRMED' ? 'Violation Confirmed' : status;
      break;

    case 'FIELD_VERIFICATION':
    case 'OFFICER_REVIEW':
    case 'INSPECTION_REQUIRED':
    case 'FOLLOW_UP':
      icon = <FileCheck size={12} />;
      className = 'badge-field_verification';
      label = clean === 'FIELD_VERIFICATION' ? 'In Field Inspection' : clean === 'INSPECTION_REQUIRED' ? 'Inspection Required' : clean === 'FOLLOW_UP' ? 'Follow-Up' : 'Officer Review';
      break;

    case 'OPEN':
    case 'MEDIUM':
      icon = <Clock size={12} />;
      className = 'badge-pending';
      label = clean === 'OPEN' ? 'Case Open' : status;
      break;

    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'LOW':
    default:
      icon = <Clock size={12} />;
      className = 'badge-submitted';
      label = clean === 'UNDER_REVIEW' ? 'Under Review' : status;
      break;
  }

  return (
    <span className={`badge ${className} ${size === 'lg' ? 'badge-lg' : ''}`} title={`Status: ${label}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
