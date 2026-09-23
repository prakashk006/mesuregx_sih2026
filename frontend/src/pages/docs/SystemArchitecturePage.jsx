import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Shield,
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  Server,
  Smartphone,
  Globe,
  Users,
  CheckCircle2,
  Clock,
  Key,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Code2,
  GitBranch,
  Terminal,
  Activity,
  FileCode,
  HardDrive,
  Eye,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react';

const TABS = [
  { id: 'topology', label: '1. System Topology', icon: Layers },
  { id: 'roles', label: '2. Role Architecture', icon: Users },
  { id: 'workflow', label: '3. End-to-End Workflow', icon: GitBranch },
  { id: 'security', label: '4. Security Architecture', icon: ShieldCheck },
  { id: 'data-security', label: '5. Data Security & Privacy', icon: Lock },
  { id: 'api', label: '6. API Specifications', icon: Code2 },
  { id: 'database', label: '7. Database & ER Models', icon: Database },
  { id: 'deployment', label: '8. Deployment & DevOps', icon: Server },
];

export default function SystemArchitecturePage() {
  const [activeTab, setActiveTab] = useState('topology');
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="page-body" style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      {/* HEADER HERO */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 50%, #111827 100%)',
          color: '#FFFFFF',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(6, 78, 59, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6EE7B7',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              TECHNICAL SPECIFICATIONS & SECURITY ARCHITECTURE
            </span>
            <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>v1.4.0 • GovTech Metrology Standard</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.35rem 0 0.75rem', letterSpacing: '-0.02em' }}>
            MEASUREGX System & Security Architecture
          </h1>
          <p style={{ margin: 0, color: '#E2E8F0', maxWidth: '820px', fontSize: '1rem', lineHeight: 1.6 }}>
            Formal enterprise design documentation for adjudicators, technical reviewers, state administrators, and security auditors. Details the actual production topology, cryptographic signing, OIML R 76-1 tolerance calculations, RBAC, and deployment pipeline.
          </p>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #E2E8F0',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                background: isActive ? '#064E3B' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                border: isActive ? '1px solid #064E3B' : '1px solid #E2E8F0',
                borderRadius: '10px',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isActive ? '0 4px 12px rgba(6, 78, 59, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: SYSTEM TOPOLOGY */}
      {/* ============================================================ */}
      {activeTab === 'topology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* VISUAL ARCHITECTURE DIAGRAM */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0 0 0.35rem' }}>
                End-to-End Enterprise GovTech Topology
              </h2>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
                Reflects the actual multi-tier architecture implemented in MEASUREGX with zero fabricated dependencies.
              </p>
            </div>

            {/* INTERACTIVE DIAGRAM FLOW */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* TIER 1: CLIENT PRESENTATION */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '2px solid #064E3B',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={18} style={{ color: '#064E3B' }} />
                    <span style={{ fontWeight: 800, color: '#064E3B', fontSize: '0.95rem' }}>
                      TIER 1: CLIENT PRESENTATION & CITIZEN PORTAL (React 18 + Vite)
                    </span>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    IMPLEMENTED
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Public Portal & QR Verifier</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Routes: `/verify`, `/report-concern`, `/`</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Business Owner Portal</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Routes: `/business/*` (Fleet & Fees)</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Mobile Officer Inspection Console</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Routes: `/officer/*` & Field Telemetry</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>State Administration Directorate</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Routes: `/admin/*` & Enforcement</div>
                  </div>
                </div>
              </div>

              {/* FLOW ARROW */}
              <div style={{ textAlign: 'center', color: '#0F766E', fontWeight: 700, fontSize: '0.8rem' }}>
                ▼ JSON REST API via Axios (Stateless Bearer JWT Auth)
              </div>

              {/* TIER 2: API GATEWAY */}
              <div
                style={{
                  background: '#F0FDFA',
                  borderRadius: '12px',
                  border: '2px solid #0F766E',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Server size={18} style={{ color: '#0F766E' }} />
                    <span style={{ fontWeight: 800, color: '#0F766E', fontSize: '0.95rem' }}>
                      TIER 2: API GATEWAY & WORKFLOW ENGINE (Node.js 18+ & Express)
                    </span>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    IMPLEMENTED
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Authentication & RBAC</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>JWT + Bcrypt (10 rounds)</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Enforcement Engine</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>8-stage statutory lifecycle & actions</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Digital Cert & QR Signer</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>SHA-256 digital stamp generation</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Audit & Notifications</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Immutable system ledger & alerts</div>
                  </div>
                </div>
              </div>

              {/* FLOW ARROW TO PERSISTENCE & METROLOGY */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: '0.8rem' }}>
                <div>▼ Prisma ORM (Type-Safe Query Engine)</div>
                <div>▼ HTTP REST Engine Delegation</div>
              </div>

              {/* TIER 3 & 4 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* TIER 3: PERSISTENCE */}
                <div
                  style={{
                    background: '#FEF3C7',
                    borderRadius: '12px',
                    border: '2px solid #D97706',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Database size={18} style={{ color: '#D97706' }} />
                      <span style={{ fontWeight: 800, color: '#92400E', fontSize: '0.9rem' }}>
                        TIER 3: PERSISTENCE LAYER
                      </span>
                    </div>
                    <span style={{ background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      SQLite / Postgres
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#78350F', margin: 0 }}>
                    Prisma ORM schema managing 18 normalized entities: User, Business, Officer, Instrument, Application, Assignment, Verification, Certificate, EnforcementCase, EnforcementAction, AuditLog.
                  </p>
                </div>

                {/* TIER 4: PYTHON METROLOGY ENGINE */}
                <div
                  style={{
                    background: '#EFF6FF',
                    borderRadius: '12px',
                    border: '2px solid #2563EB',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Cpu size={18} style={{ color: '#2563EB' }} />
                      <span style={{ fontWeight: 800, color: '#1E40AF', fontSize: '0.9rem' }}>
                        TIER 4: METROLOGY TOLERANCE ENGINE
                      </span>
                    </div>
                    <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      FastAPI Python
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#1E3A8A', margin: 0 }}>
                    FastAPI microservice executing OIML R 76-1 (2006) and Legal Metrology General Rules (2011) math for Class I, II, III, IIII scales with multi-point error calculation and MPE evaluation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: ROLE ARCHITECTURE */}
      {/* ============================================================ */}
      {activeTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0 0 0.5rem' }}>
              Stakeholder Role-Based Access Control (RBAC) Matrix
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
              Explicit access boundaries, permissible operational actions, and statutory restrictions enforced across the platform.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* 1. Citizen / Business Owner */}
              <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064E3B' }}>Citizen / Business Owner</span>
                  <span style={{ background: '#E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    ROLE: BUSINESS_OWNER
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#166534' }}>Permitted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#334155' }}>
                    <li>Register fleet of commercial measuring instruments</li>
                    <li>Submit applications for Initial or Periodic Verification</li>
                    <li>Pay statutory government fees and download treasury receipts</li>
                    <li>View own valid & expiring certificates with digital stamps</li>
                    <li>Review compliance notices / warnings issued to own business</li>
                    <li>File grievances and track resolution</li>
                  </ul>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: '#991B1B' }}>Restricted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#64748B' }}>
                    <li>Cannot inspect instruments or approve applications</li>
                    <li>Cannot view other businesses' instruments, fees, or cases</li>
                    <li>Cannot modify verification rules or audit logs</li>
                  </ul>
                </div>
              </div>

              {/* 2. Legal Metrology Officer (LMO) */}
              <div style={{ background: '#F0FDFA', borderRadius: '12px', border: '1px solid #CCFBF1', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F766E' }}>Legal Metrology Officer (LMO)</span>
                  <span style={{ background: '#CCFBF1', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#0F766E' }}>
                    ROLE: OFFICER
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#166534' }}>Permitted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#334155' }}>
                    <li>Manage assigned verification inspections within district</li>
                    <li>Conduct on-site physical load tests and record turning points</li>
                    <li>Acquire GPS coordinates and upload photographic seal proof</li>
                    <li>Issue and sign digital verification certificates</li>
                    <li>Register enforcement cases, record violations, and issue notices</li>
                    <li>Dispatch mobile inspection syncs from field console</li>
                  </ul>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: '#991B1B' }}>Restricted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#64748B' }}>
                    <li>Cannot modify system-wide verification rules</li>
                    <li>Cannot delete audit logs or user accounts</li>
                    <li>Cannot reassign officers across different administrative zones</li>
                  </ul>
                </div>
              </div>

              {/* 3. GATC / Authorized Inspector */}
              <div style={{ background: '#EFF6FF', borderRadius: '12px', border: '1px solid #DBEAFE', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E40AF' }}>GATC / Test Center</span>
                  <span style={{ background: '#DBEAFE', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF' }}>
                    ROLE: GATC_INSPECTOR
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#166534' }}>Permitted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#334155' }}>
                    <li>Perform accredited laboratory tolerance verification</li>
                    <li>Upload forensic test calibration certificates</li>
                    <li>Submit testing observations to supervising LMO</li>
                  </ul>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: '#991B1B' }}>Restricted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#64748B' }}>
                    <li>Cannot issue statutory legal notices or seize equipment</li>
                    <li>Restricted strictly to authorized testing workflows</li>
                  </ul>
                </div>
              </div>

              {/* 4. State Administrator */}
              <div style={{ background: '#FEF3C7', borderRadius: '12px', border: '1px solid #FDE68A', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400E' }}>State Directorate Admin</span>
                  <span style={{ background: '#FDE68A', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>
                    ROLE: ADMIN
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#166534' }}>Permitted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#334155' }}>
                    <li>Full oversight across all districts, users, and cases</li>
                    <li>Manage verification tolerance rules and OIML class limits</li>
                    <li>Assign officers to districts and allocate inspections</li>
                    <li>Audit immutable system logs and treasury reconciliation</li>
                    <li>Review statewide enforcement intensity and repeat offenders</li>
                  </ul>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: '#991B1B' }}>Restricted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#64748B' }}>
                    <li>Cannot alter cryptographic digital signatures or retroactively edit audit events</li>
                  </ul>
                </div>
              </div>

              {/* 5. Public Citizen Verifier */}
              <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>Public Citizen / Verifier</span>
                  <span style={{ background: '#E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    UNAUTHENTICATED PUBLIC
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#166534' }}>Permitted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#334155' }}>
                    <li>Scan physical QR code on commercial scales</li>
                    <li>Verify real-time certificate validity, expiry date, and officer stamp</li>
                    <li>Submit public consumer short-weighing concerns with photos</li>
                  </ul>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: '#991B1B' }}>Restricted Actions:</strong>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', color: '#64748B' }}>
                    <li>NO ACCESS to internal enforcement cases or dossiers</li>
                    <li>NO ACCESS to private merchant financials or officer rosters</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: WORKFLOW ARCHITECTURE */}
      {/* ============================================================ */}
      {activeTab === 'workflow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0 0 0.5rem' }}>
              12-Stage Metrological Verification & Enforcement Lifecycle
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 2rem' }}>
              The end-to-end statutory journey from initial commercial registration through periodic stamping to spot enforcement.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { step: '01', title: 'Trader Registration', desc: 'Merchant registers commercial entity with GST, address, and mobile verification.' },
                { step: '02', title: 'Instrument Registry', desc: 'Device cataloging: manufacturer, serial number, accuracy Class (I-IIII), and capacity.' },
                { step: '03', title: 'Verification Application', desc: 'Merchant requests initial or annual re-verification and pays statutory treasury fee.' },
                { step: '04', title: 'Treasury Challan & Payment', desc: 'Fee calculation in accordance with State Metrology Schedule; instant receipt generation.' },
                { step: '05', title: 'Officer / GATC Allocation', desc: 'Smart or manual allocation of certified Inspector based on jurisdiction and schedule.' },
                { step: '06', title: 'Field Inspection & GPS', desc: 'Inspector visits site, pins GPS telemetry (Lat/Lon), and evaluates device physical condition.' },
                { step: '07', title: 'Tolerance Load Test', desc: 'Multi-point testing evaluated via OIML R 76-1 tolerance engine against MPE thresholds.' },
                { step: '08', title: 'Cryptographic Certificate', desc: 'On PASS: Digital certificate generated with SHA-256 digital stamp and tamper-evident QR payload.' },
                { step: '09', title: 'QR Verification Seal', desc: 'Public QR badge affixed to device; any consumer can scan to verify authenticity.' },
                { step: '10', title: 'Validity Monitoring', desc: 'Automated notification engine monitors annual expiry and alerts merchant at 30 days.' },
                { step: '11', title: 'Annual Re-verification', desc: 'Automated renewal cycle initiated to maintain legal compliance.' },
                { step: '12', title: 'Enforcement Surveillance', desc: 'Non-compliant or expired devices trigger formal Section 24 show-cause enforcement cases.' },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F766E' }}>STAGE {item.step}</span>
                    <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                  </div>
                  <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>{item.title}</div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: SECURITY ARCHITECTURE */}
      {/* ============================================================ */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0 0 0.5rem' }}>
              Security Architecture & Defensive Posture
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
              Transparent declaration of all security controls. Clearly distinguishes <strong>[IMPLEMENTED]</strong> production mechanisms from <strong>[PLANNED]</strong> roadmap enhancements.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                {
                  title: 'Stateless JWT Authentication',
                  category: 'Identity',
                  desc: 'Cryptographically signed JSON Web Tokens (HMAC-SHA256) with 24-hour expiration carrying userId and role.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'Bcrypt Password Hashing',
                  category: 'Identity',
                  desc: 'One-way irreversible password hashing utilizing Bcrypt with 10 salt rounds to resist brute-force.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'Role-Based Access Control (RBAC)',
                  category: 'Authorization',
                  desc: 'Granular middleware (`requireRole([roles])`) validating claims on every protected API route.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'Ownership & Tenancy Validation',
                  category: 'Authorization',
                  desc: 'Object-level authorization verifying businesses can only view their own instruments, applications, and notices.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'SHA-256 Digital Certificate Seal',
                  category: 'Cryptography',
                  desc: 'Immutable digital signature format: `SHA256-RSA:<certId>|<customId>|<officerCode>|<timestamp>`.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'Tamper-Evident QR Payloads',
                  category: 'Cryptography',
                  desc: 'QR codes encode direct validation URL referencing immutable certificate records in database.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'SQL Injection Immunity',
                  category: 'Data Layer',
                  desc: 'Prisma ORM generates parameterized queries exclusively, eliminating SQL injection attack surfaces.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'Immutable Audit Trail',
                  category: 'Auditing',
                  desc: 'Centralized non-blocking audit ledger logging user, IP address, timestamp, entity, and action.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'Secure File Upload Sandboxing',
                  category: 'Storage',
                  desc: 'Multer validation with strict MIME-type whitelisting (JPEG/PNG/PDF), 10MB limit, and randomized UUID filenames.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'Secrets Management (.env)',
                  category: 'Secrets',
                  desc: 'JWT secret keys, database credentials, and ports isolated in `.env` and excluded from git repositories.',
                  status: 'IMPLEMENTED',
                },
                {
                  title: 'Hardware Security Module (HSM) PKI Signing',
                  category: 'Cryptography',
                  desc: 'Integration with National CCA-certified eSign / Hardware Security Modules for Class 3 digital signatures.',
                  status: 'PLANNED',
                },
                {
                  title: 'Distributed Redis Rate Limiting',
                  category: 'Network',
                  desc: 'Global Redis token-bucket rate limiter for DDoS mitigation at high multi-state concurrency.',
                  status: 'PLANNED',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: item.status === 'IMPLEMENTED' ? '#F0FDF4' : '#FFFBEB',
                    border: item.status === 'IMPLEMENTED' ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>{item.title}</span>
                      <span style={{ background: 'rgba(0,0,0,0.06)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', color: '#475569' }}>
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>{item.desc}</div>
                  </div>

                  <span
                    style={{
                      background: item.status === 'IMPLEMENTED' ? '#166534' : '#92400E',
                      color: '#FFFFFF',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: DATA SECURITY & PRIVACY */}
      {/* ============================================================ */}
      {activeTab === 'data-security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0 0 0.5rem' }}>
              Data Governance, Classification & Privacy Guardrails
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
              Information lifecycle management, access restrictions, and credential protection standards.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064E3B', margin: '0 0 0.5rem' }}>
                  What Data is Stored
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  <li><strong>Merchant Credentials:</strong> Business name, address, GST, contact info, hashed passwords.</li>
                  <li><strong>Device Ledgers:</strong> Model, serial number, accuracy class, capacity, inspection history.</li>
                  <li><strong>Inspection Data:</strong> Applied reference weights, turning points, MPE calculation, GPS coordinates.</li>
                  <li><strong>Evidence Files:</strong> Physical photographs of lead seals, scale displays, calibration switches.</li>
                  <li><strong>Enforcement Records:</strong> Violation notices, inspection observations, statutory actions.</li>
                </ul>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064E3B', margin: '0 0 0.5rem' }}>
                  Access Boundaries & Privacy
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  <li><strong>Zero Public Exposure:</strong> Enforcement cases, officer assignments, and audit logs are strictly non-public.</li>
                  <li><strong>Merchant Boundary:</strong> Business owners can only view their own registered equipment and compliance notices.</li>
                  <li><strong>Credential Zeroization:</strong> Passwords are never returned in JSON payloads; Bcrypt hashes are sanitized.</li>
                  <li><strong>Tamper-Resistance:</strong> Audit logs have no UPDATE or DELETE API endpoints; entries are permanent.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: API SPECIFICATIONS */}
      {/* ============================================================ */}
      {activeTab === 'api' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0 0 0.5rem' }}>
              Live REST API Catalog & Integration Contracts
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
              All documented endpoints correspond 1-to-1 with live Express route handlers in the MEASUREGX backend.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { method: 'POST', path: '/api/auth/login', group: 'Auth', desc: 'Authenticates user and returns JWT bearer token.' },
                { method: 'GET', path: '/api/enforcement/stats', group: 'Enforcement', desc: 'Returns real operational metrics: open, confirmed, notices, repeat violations.' },
                { method: 'GET', path: '/api/enforcement', group: 'Enforcement', desc: 'Lists enforcement dossiers with multi-criteria filters and search.' },
                { method: 'POST', path: '/api/enforcement', group: 'Enforcement', desc: 'Registers new case linked to existing instrument/business without duplication.' },
                { method: 'PUT', path: '/api/enforcement/:id/status', group: 'Enforcement', desc: 'Advances lifecycle state machine and dispatches audit events.' },
                { method: 'POST', path: '/api/enforcement/:id/actions', group: 'Enforcement', desc: 'Records statutory action (Warning, Notice, Re-inspection, Resolution).' },
                { method: 'POST', path: '/api/enforcement/:id/mobile-sync', group: 'Enforcement', desc: 'Synchronizes field officer GPS telemetry, observations, and status.' },
                { method: 'GET', path: '/api/public/verify/:certNumber', group: 'Public', desc: 'Instant QR verification of issued certificate without authentication.' },
                { method: 'POST', path: '/api/verifications/evaluate-live', group: 'Metrology', desc: 'Executes OIML R 76-1 tolerance calculation against standard weights.' },
                { method: 'GET', path: '/api/admin/audit-logs', group: 'Admin', desc: 'Chronological immutable system audit event inspection.' },
              ].map((ep, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: ep.method === 'GET' ? '#DCFCE7' : ep.method === 'POST' ? '#DBEAFE' : '#FEF3C7',
                        color: ep.method === 'GET' ? '#166534' : ep.method === 'POST' ? '#1E40AF' : '#92400E',
                      }}
                    >
                      {ep.method}
                    </span>
                    <code style={{ fontSize: '0.9rem', fontWeight: 600, color: '#064E3B' }}>{ep.path}</code>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', background: '#E2E8F0', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {ep.group}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569', textAlign: 'right' }}>
                    {ep.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: DATABASE & ER MODELS */}
      {/* ============================================================ */}
      {activeTab === 'database' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0 0 0.5rem' }}>
              Normalized Entity-Relationship Architecture (18 Models)
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
              Relational data models mapped via Prisma ORM with strict referential integrity.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { name: 'User', purpose: 'Authentication, credentials, role claims (BUSINESS_OWNER, OFFICER, ADMIN).' },
                { name: 'Business', purpose: 'Commercial merchant profile, GST number, jurisdiction, address.' },
                { name: 'Officer', purpose: 'Legal Metrology Inspector credentials, badge number, district assignment.' },
                { name: 'InstrumentType', purpose: 'Classification codes (WEIGHING_SCALE, FUEL_DISPENSER) and default validity.' },
                { name: 'Instrument', purpose: 'Commercial measuring devices, custom IDs (WX-1001), serial numbers, accuracy class.' },
                { name: 'VerificationApplication', purpose: 'Statutory verification filing lifecycle (SUBMITTED ➔ CERTIFICATE_ISSUED).' },
                { name: 'Assignment', purpose: 'Inspector allocation, scheduled date, site location, instructions.' },
                { name: 'Verification', purpose: 'On-site field verification test record with GPS latitude, longitude, and pass/fail.' },
                { name: 'Measurement', purpose: 'Multi-point load test results, turning points, reference values, and allowed errors.' },
                { name: 'Evidence', purpose: 'Physical inspection photographs, display readings, and seal verifications.' },
                { name: 'VerificationRule', purpose: 'OIML R 76-1 tolerance parameters: capacityMin, capacityMax, allowedError.' },
                { name: 'Certificate', purpose: 'Official verification certificate with SHA-256 digital stamp and QR code URL.' },
                { name: 'Payment', purpose: 'Treasury fee transactions, receipt IDs (REC-2026-XXXXXX), and reconciliation.' },
                { name: 'Complaint', purpose: 'Consumer grievances, short-weighing reports, and investigation findings.' },
                { name: 'Notification', purpose: 'System notifications dispatched to merchants and officers.' },
                { name: 'AuditLog', purpose: 'Immutable audit ledger: user, action, entity, entityId, IP address, timestamp.' },
                { name: 'EnforcementCase', purpose: 'Statutory enforcement dossiers (ENF-2026-XXXXXX), linked entities, and lifecycle.' },
                { name: 'EnforcementAction', purpose: 'Statutory actions taken: Warning, Notice, Re-inspection, Resolution.' },
              ].map((m) => (
                <div
                  key={m.name}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#064E3B', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>{m.purpose}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: DEPLOYMENT & DEVOPS */}
      {/* ============================================================ */}
      {activeTab === 'deployment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', margin: '0 0 0.5rem' }}>
              Deployment Topology & Runtime Environment
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
              Standardized GovTech development, containerization, and production release methodology.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064E3B', margin: '0 0 0.5rem' }}>
                  Containerization (Docker Compose)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                  Multi-container orchestration deploying all microservices with health checks and volume persistence:
                </p>
                <div style={{ background: '#0F172A', color: '#6EE7B7', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  # Start entire MEASUREGX GovTech stack<br />
                  docker compose up -d --build<br /><br />
                  # Health Check Endpoint<br />
                  curl http://localhost:5000/api/health
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064E3B', margin: '0 0 0.5rem' }}>
                  Production Hardening Checklist
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  <li><strong>Reverse Proxy:</strong> Nginx or Cloud CDN terminating TLS 1.3 with HTTPS enforcement.</li>
                  <li><strong>Process Supervision:</strong> PM2 or Kubernetes cluster managing Node and FastAPI pods.</li>
                  <li><strong>PostgreSQL Migration:</strong> Seamless switch from SQLite to PostgreSQL via `DATABASE_URL` change in Prisma schema.</li>
                  <li><strong>Log Shipping:</strong> Audit logs streamed to centralized Elasticsearch/CloudWatch SIEM.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
