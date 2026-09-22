import React from 'react';
import {
  ShieldCheck,
  Scale,
  FileCheck,
  Building2,
  Cpu,
  Lock
} from 'lucide-react';

export default function LegalMetrologyIcons() {
  return (
    <>
      {/* 1. Shield Check (Security & Tamper Protection) - Lower Left */}
      <div
        className="m3d-icon-badge m3d-anim-float-1"
        style={{ bottom: '130px', left: '40px' }}
        title="Tamper Evident Seal & Security"
      >
        <ShieldCheck size={18} color="#064E3B" strokeWidth={2.2} />
      </div>

      {/* 2. Scale (National Metrological Standard) - Top Center Left */}
      <div
        className="m3d-icon-badge m3d-anim-float-2"
        style={{ top: '90px', left: '190px' }}
        title="OIML R76 Legal Metrology Standards"
      >
        <Scale size={18} color="#EA580C" strokeWidth={2.2} />
      </div>

      {/* 3. File Check (Cryptographic Digital Certificate) - Upper Right */}
      <div
        className="m3d-icon-badge m3d-anim-float-3"
        style={{ top: '80px', right: '195px' }}
        title="Digitally Signed Legal Certificate"
      >
        <FileCheck size={18} color="#10B981" strokeWidth={2.2} />
      </div>

      {/* 4. Building / Government Authority Node - Lower Right */}
      <div
        className="m3d-icon-badge m3d-anim-float-2"
        style={{ bottom: '135px', right: '125px' }}
        title="National Legal Metrology Authority Network"
      >
        <Building2 size={18} color="#064E3B" strokeWidth={2.2} />
      </div>

      {/* 5. CPU Transducer Node - Far Left */}
      <div
        className="m3d-icon-badge m3d-anim-float-4"
        style={{ top: '185px', left: '0px' }}
        title="Precision Digital Load Cell Sensor"
      >
        <Cpu size={18} color="#2563EB" strokeWidth={2.2} />
      </div>

      {/* 6. Cryptographic Lock - Far Right */}
      <div
        className="m3d-icon-badge m3d-anim-float-1"
        style={{ top: '195px', right: '0px' }}
        title="Cryptographic Hash Verification"
      >
        <Lock size={16} color="#10B981" strokeWidth={2.2} />
      </div>
    </>
  );
}
