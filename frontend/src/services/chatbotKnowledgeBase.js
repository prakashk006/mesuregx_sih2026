/**
 * MESUREGX Comprehensive Portal Knowledge Base & Assistant Intelligence
 * Official Reference for Indian Legal Metrology Act, 2009 & General Rules, 2011
 */

export const MESUREGX_SERVICES = [
  {
    id: 'weights-measures-verification',
    title: 'Verification & Stamping of Measuring Instruments',
    description: 'Mandatory statutory calibration and periodic verification of commercial weighing scales, weighbridges, fuel dispensers, flow meters, and counter measures under Rule 11 & 14.',
    targetAudience: 'Traders, Retailers, Petrol Pumps, Jewelers, Factories, Mandis',
    link: '/business/applications/new',
    actionText: 'Apply for Verification',
  },
  {
    id: 'digital-certificate-repository',
    title: 'Digital Verification Certificates (Form VIII)',
    description: 'Cryptographically signed tamper-proof verification certificates with instant online QR code validation and calibration expiry tracking.',
    targetAudience: 'Business Owners, Legal Metrology Officers, Citizens',
    link: '/certificates',
    actionText: 'View Certificate Repository',
  },
  {
    id: 'physical-lead-seal-tracking',
    title: 'Physical Lead Sealing & Anti-Counterfeit Tracking',
    description: 'Statutory physical lead seal serial numbering with live GPS geo-tagged photographic evidence captured on-site during inspection.',
    targetAudience: 'Legal Metrology Inspectors, Enforcement Squads',
    link: '/officer/dashboard',
    actionText: 'Go to Officer Console',
  },
  {
    id: 'citizen-public-verification',
    title: 'Public Scale QR Verification & Consumer Protection',
    description: 'Instant scan-and-verify portal allowing any consumer to verify whether a shopkeeper scale is government verified and within validity period.',
    targetAudience: 'General Public, Consumers, Citizens',
    link: '/verify',
    actionText: 'Verify a Scale Now',
  },
  {
    id: 'grievance-tampering-report',
    title: 'Report Fraudulent Scale & Tampering (Public Grievance)',
    description: 'Citizen complaint portal to report broken seals, short-weighing, rigged scales, or unverified commercial measuring instruments.',
    targetAudience: 'Consumers, Citizens, Enforcement Officers',
    link: '/report-concern',
    actionText: 'Report a Scale Tampering',
  },
];

export const STEP_BY_STEP_GUIDES = [
  {
    topic: 'apply_verification',
    keywords: ['how to apply', 'new application', 'apply for stamp', 'register scale', 'trader apply', 'periodic verification', 'application process'],
    title: 'How to Apply for Instrument Verification & Stamping (Trader Guide)',
    steps: [
      '1. Register or Log In: Create a Business Owner account with your establishment name, GSTIN/Trade license, and shop address.',
      '2. Register Your Instrument: Navigate to "My Instruments" (/business/instruments) and click "+ Add Instrument". Enter the make, model, serial number, maximum capacity, and accuracy class (Class I, II, III, or IV).',
      '3. Submit Verification Request: Go to "New Application" (/business/applications/new), select your instrument, choose your verification type (Initial, Periodic, or Post-Repair), and select your preferred inspection date.',
      '4. Statutory Fee Payment: Review inspection charges calculated as per Legal Metrology Schedule rules and complete payment.',
      '5. Officer Assignment & On-Site Inspection: A designated Legal Metrology Officer (or GATC lab) will visit your premises with standard test weights to verify accuracy, take geo-tagged photos, and affix the physical lead seal.',
      '6. Instant Digital Certificate: Once approved, download and print your official Digital Verification Certificate with a verifiable QR code sticker for your shop counter.',
    ],
    deepLinks: [
      { label: 'Register Instrument', url: '/business/instruments' },
      { label: 'Submit New Application', url: '/business/applications/new' },
    ],
  },
  {
    topic: 'verify_certificate',
    keywords: ['how to verify', 'scan qr', 'verify scale', 'check certificate', 'is scale real', 'qr code', 'verify stamp', 'authenticity'],
    title: 'How to Verify a Scale or Certificate (Public & Consumer Guide)',
    steps: [
      '1. Locate the QR Code Sticker: Every verified scale or fuel dispenser bears an official MESUREGX verification sticker with a QR code and Lead Seal Number.',
      '2. Scan with Any Phone Camera: Open your mobile camera or barcode scanner and scan the QR code on the scale sticker.',
      '3. Instant Verification Page: You will immediately see the official government record showing the trader name, machine serial number, calibration validity date, and seal status.',
      '4. Manual Search: You can also visit our public portal (/verify) and type the Certificate Number (e.g. CERT-2026-000001) or Machine ID to confirm authenticity.',
    ],
    deepLinks: [
      { label: 'Go to Public Verification', url: '/verify' },
    ],
  },
  {
    topic: 'field_inspection_process',
    keywords: ['mobile app inspection', 'how inspector verifies', 'field verification', 'officer process', 'test readings', 'standard weights', 'lead seal'],
    title: 'How Field Verification Works (Mobile Inspector Workflow)',
    steps: [
      '1. Officer Assignment: The Legal Metrology Officer opens the MESUREGX mobile app and selects the scheduled field inspection.',
      '2. Statutory Preliminary Checklist: The officer verifies GPS geofence on-site, inspects the physical serial number plate, and confirms trader attendance.',
      '3. Physical Visual Checks: Inspects previous seal integrity, zero-setting mechanism, spirit level centering, and stamping nameplate.',
      '4. Geo-Tagged Photographic Evidence: Captures high-resolution photo with automatic GPS latitude, longitude, address, and live timestamp embedded on the photo.',
      '5. Load Tests with Standard Weights: Places certified F1/M1 standard test weights at 0%, 25%, 50%, and 100% capacity. The built-in rule engine validates maximum permissible errors (MPE) under OIML R 76-1 standards.',
      '6. Physical Lead Sealing: Affixes security lead seal through the instrument calibration adjustment cavity and logs the seal serial number (e.g. SEAL-TN-990347).',
      '7. Approval & Certification: Officer signs with statutory digital affirmation. The web portal reflects the verdict and generates the official Digital Certificate.',
    ],
    deepLinks: [
      { label: 'Officer Dashboard', url: '/officer/dashboard' },
    ],
  },
  {
    topic: 'report_fraud',
    keywords: ['report fraud', 'complaint', 'broken seal', 'cheating scale', 'short weight', 'tampering', 'rigged scale', 'grievance'],
    title: 'How to Report Short-Weighing or Scale Tampering',
    steps: [
      '1. Open Report Concern: Navigate to /report-concern on the portal (available to all citizens without logging in).',
      '2. Provide Shop Details: Enter the business name, market location, and shop address.',
      '3. Select Concern Type: Options include "Broken or Missing Lead Seal", "Scale Displays Incorrect Reading", "Expired Verification Sticker", or "Refusal of Standard Weights".',
      '4. Attach Evidence: Optionally upload a photo of the scale, receipt, or shop front.',
      '5. Enforcement Tracking: The complaint is assigned to the District Legal Metrology Inspector for immediate surprise inspection and enforcement action under Section 30 of Legal Metrology Act.',
    ],
    deepLinks: [
      { label: 'File a Concern / Complaint', url: '/report-concern' },
    ],
  },
];

export const FAQ_ITEMS = [
  {
    q: 'What is MESUREGX?',
    a: 'MESUREGX is India\'s Next-Generation Digital Verification and Stamping Platform for the Department of Legal Metrology. It digitizes periodic verification of commercial measuring instruments, integrates automated OIML tolerance engines, enforces live GPS geo-tagged physical sealing, and issues tamper-proof digital certificates with QR validation.',
    links: [{ label: 'Explore Services', url: '/#services' }],
  },
  {
    q: 'What is the Legal Metrology Act, 2009?',
    a: 'The Legal Metrology Act, 2009 (and Legal Metrology General Rules, 2011) mandates that every weight or measure used in commercial transactions must be periodically verified, tested against national standards, and stamped with an official security seal to protect consumer rights and ensure fair trade.',
    links: [{ label: 'Read Standards', url: '/#standards' }],
  },
  {
    q: 'Which instruments require statutory verification on MESUREGX?',
    a: 'All commercial measuring devices including: Non-Automatic Weighing Instruments (Counter Scales, Grocery Balances), Industrial Weighbridges, Fuel & Petroleum Dispensers, Gold & Bullion Carat Balances (Class I & II), Flow Meters, Automatic Packing Machines, and Linear Length Measures.',
    links: [{ label: 'Register an Instrument', url: '/business/instruments' }],
  },
  {
    q: 'How long is a verification certificate valid?',
    a: 'Under Indian Legal Metrology Rules, standard electronic counter scales and weighbridges are typically valid for 12 or 24 months depending on state schedule and instrument class. High-precision analytical balances and fuel dispensers often have periodic annual or bi-annual schedules. The exact expiry date is printed on the Digital Certificate and stored in the QR code.',
    links: [{ label: 'View Certificate Portal', url: '/certificates' }],
  },
  {
    q: 'What is a Physical Lead Seal and why is it needed?',
    a: 'A Physical Lead Seal is a tamper-evident metallic seal crimped into the calibration adjustment cavity of a weighing scale using official pliers. It physically prevents anyone from altering internal calibration screws or programming. MESUREGX uniquely tracks every physical seal serial number alongside live GPS coordinates and digital QR certificates.',
    links: [{ label: 'Learn More', url: '/#security' }],
  },
  {
    q: 'Can the mobile app work in remote villages without internet?',
    a: 'Yes! The MESUREGX Inspector Mobile App features a "Zero-Network Village Mode" (Offline Storage Buffer). Officers can record test readings, take GPS geo-tagged photos, and affix physical lead seals offline. Once mobile signal or Wi-Fi is detected, inspections synchronize automatically with the cloud database.',
    links: [{ label: 'Officer Console', url: '/officer/dashboard' }],
  },
  {
    q: 'What are the user roles on the MESUREGX portal?',
    a: 'The portal supports 4 primary roles:\n1. Business Owner / Trader: Registers instruments, applies for verification, tracks applications, and downloads certificates.\n2. Legal Metrology Officer (LMO): Conducts field inspections, evaluates tolerances, and issues certificates.\n3. GATC Test Lab: Accredited laboratories performing specialized testing on heavy instruments.\n4. Admin: Department directors managing officers, rules, audit logs, and revenue analytics.',
    links: [{ label: 'Login to Portal', url: '/login' }, { label: 'Register Account', url: '/register' }],
  },
];

/**
 * Intelligent Query Matcher
 * Matches natural language input against guides, FAQs, and portal sections
 */
export function queryKnowledgeBase(input) {
  if (!input || typeof input !== 'string') return null;
  const clean = input.toLowerCase().trim();

  // 1. Direct Guide Match
  for (const guide of STEP_BY_STEP_GUIDES) {
    if (guide.keywords.some((k) => clean.includes(k))) {
      return {
        type: 'GUIDE',
        title: guide.title,
        steps: guide.steps,
        links: guide.deepLinks,
      };
    }
  }

  // 2. Direct FAQ Match
  for (const faq of FAQ_ITEMS) {
    const qClean = faq.q.toLowerCase();
    const words = clean.split(/\s+/).filter((w) => w.length > 3);
    const hasMatch = words.some((w) => qClean.includes(w));
    if (hasMatch || clean.includes(faq.q.toLowerCase().slice(0, 15))) {
      return {
        type: 'FAQ',
        title: faq.q,
        answer: faq.a,
        links: faq.links,
      };
    }
  }

  // 3. Keyword / Service Detection
  if (clean.includes('service') || clean.includes('feature') || clean.includes('what do you do')) {
    return {
      type: 'SERVICES_LIST',
      title: 'MESUREGX Statutory Services & Modules',
      services: MESUREGX_SERVICES,
    };
  }

  if (clean.includes('fee') || clean.includes('cost') || clean.includes('price') || clean.includes('challan') || clean.includes('payment')) {
    return {
      type: 'CUSTOM',
      title: 'Statutory Verification Fees & Payment',
      answer: 'Verification fees are calculated based on the instrument type and capacity as prescribed under the Legal Metrology (General) Rules, 2011. Fees can be paid online via Net Banking/UPI on the portal (/business/payments) or via government Treasury Challan on-site with the inspecting officer.',
      links: [{ label: 'View Fee Schedule & Payments', url: '/business/payments' }],
    };
  }

  if (clean.includes('login') || clean.includes('register') || clean.includes('account') || clean.includes('signup') || clean.includes('sign in')) {
    return {
      type: 'CUSTOM',
      title: 'Portal Access & Account Registration',
      answer: 'Traders and business owners can create an account in 2 minutes: Click "Register" at top right, choose "Business Owner", enter your Trade Name, District, and GSTIN/Aadhaar. Officers and GATC labs are provisioned by District Admin with official credentials.',
      links: [
        { label: 'Register Business', url: '/register' },
        { label: 'Login Now', url: '/login' },
      ],
    };
  }

  // 4. Default Helpful Fallback
  return {
    type: 'FALLBACK',
    title: 'I can help guide you through the MESUREGX Portal!',
    answer: 'I can explain any part of the portal and legal metrology operations. Choose an option below or type your question:',
    suggestedChips: [
      '📝 How do I apply for verification?',
      '🔍 How to verify a scale QR code?',
      '📱 How does the mobile inspector app work?',
      '🔐 What is physical lead sealing?',
      '🚨 How to report scale fraud or tampering?',
      '🎯 What is MESUREGX?',
    ],
  };
}
