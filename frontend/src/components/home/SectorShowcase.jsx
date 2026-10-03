import React from 'react';
import { ShieldCheck, Scale, QrCode, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTOR_STORIES = [
  {
    id: 'weighbridges',
    badge: 'HEAVY WEIGHBRIDGES • OIML R 76',
    title: 'Industrial Weighbridges & Agricultural Mandis',
    description: 'Statutory 50-tonne bulk calibration with certified F1/M1 cast-iron test weights, securing trade in grain mandis, logistics corridors, and cement factories.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    stat: '±0.02% Tolerance Check',
    link: '/business/applications/new',
    linkText: 'Apply for Weighbridge Test',
  },
  {
    id: 'retail',
    badge: 'RETAIL SCALES • CLASS III',
    title: 'Kirana, Supermarkets & Bazaar Counter Balances',
    description: 'On-site periodic verification and security stamping of retail electronic balances, ensuring fair trade and full consumer value for every gram purchased.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    stat: '100% Consumer Protection',
    link: '/verify',
    linkText: 'Verify a Retail Scale',
  },
  {
    id: 'fuel',
    badge: 'PETROLEUM DISPENSERS • OIML R 117',
    title: 'Petrol, Diesel & CNG Dispensing Units',
    description: 'Official inspectors conduct volumetric proving tests with standard 5-litre and 10-litre brass conical measures to guarantee delivery accuracy.',
    image: 'https://images.unsplash.com/photo-1527018606412-a3c3230d0155?auto=format&fit=crop&w=800&q=80',
    stat: 'Zero Short-Fueling Mandate',
    link: '/report-concern',
    linkText: 'Report Fuel Discrepancy',
  },
  {
    id: 'jewelry',
    badge: 'GOLD & JEWELRY • CLASS I & II',
    title: 'Bullion, Gems & Jewelry Micro-Balances',
    description: 'High-precision micro-gram calibration for precious metals, diamonds, and bullion trade complying with international Class I accuracy schedules.',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
    stat: '0.001g High Precision',
    link: '/business/applications/new',
    linkText: 'Jewelry Balance Verification',
  },
  {
    id: 'lead-seals',
    badge: 'PHYSICAL LEAD SEALS • RULE 13',
    title: 'Physical Lead Sealing & Tamper Prevention',
    description: 'Inspectors crimp tamper-evident metallic lead seals into calibration cavities. Uniquely serial-numbered and tracked alongside live GPS geo-tagged photos.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    stat: 'Anti-Tampering Physical Lock',
    link: '/#security',
    linkText: 'Learn About Lead Seals',
  },
  {
    id: 'qr-verification',
    badge: 'DIGITAL e-STAMP • 24/7 TRANSPARENCY',
    title: 'Instant QR Certificate Validation for Citizens',
    description: 'Every verified measuring device carries a QR code sticker. Any consumer or enforcement officer can scan to confirm legality, trader name, and expiry date.',
    image: 'https://images.unsplash.com/photo-1595079672139-5470805086e7?auto=format&fit=crop&w=800&q=80',
    stat: 'Real-time Cloud Ledger',
    link: '/verify',
    linkText: 'Scan / Verify Online',
  },
];

export default function SectorShowcase() {
  return (
    <section
      id="sectors"
      style={{
        padding: '5rem 1.5rem 6rem',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#064E3B',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
            }}
          >
            <ShieldCheck size={14} color="#059669" />
            विधिक मापविज्ञान प्रभाग कार्यप्रणाली • LEGAL METROLOGY IN ACTION
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(2.1rem, 4vw, 3.1rem)',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Sovereign Measurement Verification{' '}
            <span style={{ color: '#064E3B' }}>Across Every Sector</span>
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: '1.05rem',
              maxWidth: '740px',
              margin: '0.75rem auto 0',
              lineHeight: 1.6,
            }}
          >
            From 50-tonne highway weighbridges to milligram gold carat balances and petrol dispensing pumps, MESUREGX ensures accuracy, fair trade, and statutory compliance under the Legal Metrology Act, 2009.
          </p>
        </div>

        {/* 6-Card Responsive Photo Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2rem',
          }}
        >
          {SECTOR_STORIES.map((sector) => (
            <div
              key={sector.id}
              style={{
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              className="hover:scale-[1.01] hover:shadow-xl"
            >
              {/* Photo Banner with Badge Overlay */}
              <div style={{ position: 'relative', height: '210px', overflow: 'hidden', backgroundColor: '#0F172A' }}>
                <img
                  src={sector.image}
                  alt={sector.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  className="hover:scale-105"
                  loading="lazy"
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#10B981',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {sector.badge}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 14,
                    backgroundColor: 'rgba(6, 78, 59, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                  }}
                >
                  ✓ {sector.stat}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    marginBottom: '0.65rem',
                    lineHeight: 1.35,
                  }}
                >
                  {sector.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#475569',
                    lineHeight: 1.55,
                    marginBottom: '1.5rem',
                    flex: 1,
                  }}
                >
                  {sector.description}
                </p>

                <div
                  style={{
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Link
                    to={sector.link}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#064E3B',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    {sector.linkText} <ArrowRight size={14} />
                  </Link>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#059669',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <CheckCircle2 size={13} /> Statutory Standard
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
