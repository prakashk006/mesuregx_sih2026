/**
 * MESUREGX Comprehensive Portal Knowledge Base & Assistant Intelligence
 * Official Reference for Indian Legal Metrology Act, 2009 & General Rules, 2011
 * 
 * Features:
 * - Natural conversational intent matching (weighted semantic scoring)
 * - Deep educational explanations for all portal queries
 * - Contextual follow-up chips
 */

export const STATUTORY_TOPICS = [
  // 1. LEGAL METROLOGY OFFICER (LMO) / INSPECTOR
  {
    id: 'officer-role-and-inspection',
    badge: '⚖️ Officer & Inspection Role',
    keywords: [
      'officer', 'inspector', 'lmo', 'legal metrology officer', 'who is officer', 
      'what officer does', 'officer duties', 'field officer', 'inspect scale', 
      'who inspects', 'inspection process', 'officer assignment', 'assign officer',
      'assigned officer', 'inspector role'
    ],
    title: 'Legal Metrology Officers (Inspectors) & Their Statutory Role',
    answer: `In MESUREGX, a **Legal Metrology Officer (LMO)** (statutorily designated as an Inspector) is an authorized government official appointed under Section 24 of the Legal Metrology Act, 2009.\n\nOfficers are responsible for ensuring that all commercial weighing and measuring instruments in markets, industries, petrol pumps, and mandis deliver strictly accurate measurements.`,
    bullets: [
      '📍 On-Site Verification: Officers visit registered trader premises with calibrated standard test weights (F1/M1 class) to perform tolerance testing.',
      '🎯 OIML Accuracy Checks: The officer tests scales at 0%, 25%, 50%, and 100% capacity to verify error limits (MPE) under OIML R 76-1 standards.',
      '🔒 Physical Lead Sealing: Affixes an official tamper-proof lead seal with an embedded serial number into the calibration adjusting cavity (Rule 13).',
      '📸 Live Geo-Tagged Proof: The officer uses the MESUREGX mobile app to capture live GPS geo-tagged photos of the stamped scale on-site.',
      '📜 Statutory Decision: If compliant, the officer approves the verification and issues the Digital Verification Certificate (Form VIII). If inaccurate, a statutory Repair Notice (Form IX) is issued.',
      '🤝 How an Officer is Assigned: When a trader applies on this portal, the system automatically assigns the jurisdiction-designated District Inspector based on your shop pin code and preferred inspection date.',
    ],
    deepLinks: [
      { label: 'View Verification Journey', url: '/#journey' },
      { label: 'Public Scale Verification', url: '/verify' },
    ],
    suggestedChips: [
      '⚖️ What standard weights does an officer use?',
      '⚠️ What happens if a scale fails inspection?',
      '📝 How do I apply for an officer visit?',
      '📱 How does the mobile inspector app work?',
    ],
  },

  // 2. REJECTION & REPAIR NOTICE (FORM IX)
  {
    id: 'scale-rejection-and-repair',
    badge: '⚠️ Non-Compliance & Repairs',
    keywords: [
      'fail', 'reject', 'rejected', 'repair notice', 'form ix', 'scale inaccurate', 
      'what if fail', 'deviation', 'tolerance exceed', 'repair scale', 're-verification',
      'failed inspection'
    ],
    title: 'What Happens if an Instrument Fails Inspection?',
    answer: `If an instrument exceeds Maximum Permissible Error (MPE) or exhibits mechanical tampering, the Legal Metrology Officer will **NOT** stamp the machine. Instead, statutory enforcement procedure under Rule 15 is initiated:`,
    bullets: [
      '1. Form IX Repair Notice: The officer issues an official statutory Repair Notice specifying the exact error or defect detected.',
      '2. Stamping Prohibited: The instrument cannot be used commercially until rectified to protect consumers from incorrect billing.',
      '3. Licensed Repairer Service: The trader must have the machine calibrated by a licensed Legal Metrology Repairer.',
      '4. Re-Verification Request: Within 7 to 14 days, the trader re-submits the application on the portal for re-inspection and stamping.',
    ],
    deepLinks: [
      { label: 'Submit Re-Verification', url: '/business/applications/new' },
      { label: 'My Applications', url: '/business/applications' },
    ],
    suggestedChips: [
      '⚖️ Who is the Legal Metrology Officer?',
      '📝 How do I apply for verification?',
      '💰 How are verification fees calculated?',
    ],
  },

  // 3. HOW TO APPLY (TRADER & BUSINESS JOURNEY)
  {
    id: 'how-to-apply-verification',
    badge: '📋 Application Guide',
    keywords: [
      'how to apply', 'new application', 'apply verification', 'register scale', 
      'trader guide', 'apply for stamp', 'application process', 'how to register', 
      'get certificate', 'step to apply', 'periodic verification'
    ],
    title: 'Step-by-Step: How to Apply for Verification & Stamping',
    answer: `Applying for periodic or initial verification on MESUREGX takes less than 3 minutes. Here is the complete trader workflow:`,
    bullets: [
      'Step 1: Sign in to your Business Owner account (or register with Trade Name & GSTIN/Aadhaar).',
      'Step 2: Add your instrument under "My Instruments" (/business/instruments) by entering make, model, capacity, and serial number.',
      'Step 3: Click "New Application" (/business/applications/new) and select your verification type (Initial, Periodic, or Post-Repair).',
      'Step 4: Choose your preferred inspection date and verification pattern (Pattern A: Field Premises Visit, or Pattern B: Lab Bring-In).',
      'Step 5: Pay the statutory inspection fee online via UPI/Net Banking or note Treasury Challan details.',
      'Step 6: The designated District Officer visits your premises, conducts OIML load tests, affixes the physical lead seal, and issues your instant Digital QR Certificate.',
    ],
    deepLinks: [
      { label: 'Apply for Verification Now', url: '/business/applications/new' },
      { label: 'Register an Instrument', url: '/business/instruments' },
    ],
    suggestedChips: [
      '💰 How are verification fees calculated?',
      '⚖️ Who is the Legal Metrology Officer?',
      '🔍 How to verify a certificate with QR?',
      '🔐 What is physical lead sealing?',
    ],
  },

  // 4. STATUTORY FEES & TREASURY CHALLAN (RULE 16)
  {
    id: 'statutory-fees-and-challan',
    badge: '💰 Fees & Payments',
    keywords: [
      'fee', 'fees', 'cost', 'charge', 'price', 'challan', 'treasury', 'payment', 
      'how much', 'rates', 'pay online', 'rule 16', 'statutory charges'
    ],
    title: 'Statutory Verification Fees & Payment Options',
    answer: `Verification fees on MESUREGX are statutory government dues determined strictly by the Legal Metrology (General) Rules, 2011 Schedule:`,
    bullets: [
      '⚖️ Electronic Counter Balances (≤ 50 kg): Standard statutory fee between ₹100 - ₹300 depending on state schedule and verification period.',
      '🚛 Heavy Weighbridges (10T - 100T): ₹2,000 - ₹5,000 depending on capacity and test wagon mobilization.',
      '⛽ Petrol & Diesel Flow Meters: Statutory fee per dispensing nozzle.',
      '💎 High-Precision Jewelers Scales (Class I & II): Scheduled specialized fee for micro-gram accuracy testing.',
      '💳 Online Payment: Secure payment via UPI, Debit Card, Credit Card, or Net Banking on the portal.',
      '🏛️ Treasury Challan (Pattern A): For on-site field visits, fees can also be credited to the state Treasury and the Challan number recorded directly in the officer mobile inspection log.',
    ],
    deepLinks: [
      { label: 'View Fee Schedule & Payments', url: '/business/payments' },
    ],
    suggestedChips: [
      '📝 How do I apply for verification?',
      '⚖️ What does an officer do during an inspection?',
      '📜 How long is a certificate valid?',
    ],
  },

  // 5. DIGITAL VERIFICATION CERTIFICATES (FORM VIII) & QR CODE
  {
    id: 'digital-certificate-and-qr',
    badge: '📜 Certificates & QR',
    keywords: [
      'certificate', 'qr code', 'verify certificate', 'form viii', 'download certificate', 
      'tamper proof', 'digital certificate', 'validity', 'expiry', 'valid for how long',
      'how to verify', 'scan qr'
    ],
    title: 'Digital Verification Certificates (Form VIII) & QR Validation',
    answer: `MESUREGX replaces obsolete paper certificates with cryptographically signed, tamper-proof Digital Verification Certificates:`,
    bullets: [
      '🛡️ Cryptographic Integrity: Every approved verification generates an authentic Form VIII certificate with an encrypted hash and digital officer affirmation.',
      '📱 Public QR Code: Each certificate includes a unique QR code sticker meant to be displayed on the trader’s machine or shop counter.',
      '🔍 Instant Citizen Verification: Any consumer can scan the sticker with their phone camera to confirm trader identity, machine serial number, calibration date, and validity expiry.',
      '⏳ Validity Period: Electronic counter scales are typically certified for 12 to 24 months based on state schedule. High-precision and fuel meters follow annual calibration schedules.',
    ],
    deepLinks: [
      { label: 'Public QR Verification Portal', url: '/verify' },
      { label: 'Certificate Repository', url: '/certificates' },
    ],
    suggestedChips: [
      '🔍 How do I scan a scale QR code?',
      '📝 How to apply for renewal certificate?',
      '🚨 How to report an expired or fake certificate?',
    ],
  },

  // 6. PHYSICAL LEAD SEALING & ANTI-TAMPER SECURITY
  {
    id: 'physical-lead-sealing',
    badge: '🔒 Anti-Tamper Sealing',
    keywords: [
      'seal', 'sealing', 'lead seal', 'physical seal', 'wire seal', 'tamper', 
      'tampering', 'security seal', 'anti tamper', 'rule 13', 'pliers'
    ],
    title: 'Physical Lead Sealing (Rule 13) & Anti-Tampering',
    answer: `Physical lead sealing is a legal mandate under Rule 13 of the Legal Metrology General Rules, 2011:`,
    bullets: [
      '🛡️ Why Physical Sealing is Mandatory: Electronic scales have internal calibration screws and programming jumpers. The lead seal physically covers and locks the adjustment cavity using copper/nylon wire.',
      '🏷️ Unique Serial Numbers: Every lead seal has an embossed serial number (e.g. SEAL-TN-849201) stamped by the officer’s official plier dies.',
      '📸 Photo Audit Trail: The officer captures an on-site photo of the affixed lead seal with GPS coordinates, preventing fraudulent sticker copies.',
      '⚖️ Legal Penalty: Breaking or tampering with an official lead seal without an authorized officer is a criminal offense punishable under Section 30 with severe fines and machine confiscation.',
    ],
    deepLinks: [
      { label: 'Report Broken or Tampered Seal', url: '/report-concern' },
    ],
    suggestedChips: [
      '🚨 How do I report a tampered scale?',
      '⚖️ What does the officer inspect on-site?',
      '📱 How does the mobile inspector app verify seals?',
    ],
  },

  // 7. MOBILE INSPECTOR APP & ZERO-NETWORK VILLAGE MODE
  {
    id: 'mobile-app-village-mode',
    badge: '📱 Mobile Inspector Tech',
    keywords: [
      'mobile app', 'offline', 'village', 'village mode', 'zero network', 
      'sync', 'camera', 'gps', 'geo-tag', 'mobile verification', 'remote area'
    ],
    title: 'MESUREGX Mobile Inspector App & Offline Village Mode',
    answer: `The MESUREGX Officer Mobile App is purpose-built for field officers operating in rural mandis, highway weighbridges, and remote villages:`,
    bullets: [
      '📶 Zero-Network Village Mode: When inspecting scales in remote areas with no cellular signal, the app executes OIML tolerance calculations and GPS stamping 100% locally on the device.',
      '💾 Local Storage Buffer: Completed inspections and photos are saved in an encrypted offline buffer on the phone.',
      '🔄 Auto-Sync: Once the officer reconnects to mobile data or Wi-Fi, records automatically synchronize to the PostgreSQL cloud database.',
      '📍 Statutory On-Site Gating: Officers cannot skip steps — premises geofence, serial matching, and live photos must be taken on-site before certificates can be issued.',
      '🔒 Completed Inspection Freeze: Certified records lock into read-only mode to prevent accidental overrides.',
    ],
    deepLinks: [
      { label: 'View Platform Architecture', url: '/#features' },
    ],
    suggestedChips: [
      '⚖️ What are the officer inspection steps?',
      '🔒 What is physical lead sealing?',
      '📝 How do traders track application status?',
    ],
  },

  // 8. CITIZEN GRIEVANCE & REPORTING CHEATING SCALES
  {
    id: 'report-cheating-and-tampering',
    badge: '🚨 Consumer Protection',
    keywords: [
      'report', 'complaint', 'cheating', 'short weight', 'fraud', 'grievance', 
      'fake scale', 'broken seal', 'scam', 'consumer rights', 'file complaint',
      'report shopkeeper'
    ],
    title: 'How Consumers Can Report Scale Tampering & Short-Weighing',
    answer: `If you suspect a shopkeeper, vegetable vendor, or petrol pump is using a rigged scale, tampered lead seal, or delivering short weight:`,
    bullets: [
      '1. Open Public Grievance Portal: Visit /report-concern on MESUREGX (no login required for citizens).',
      '2. Specify Shop Location: Enter the establishment name, street address, and market locality.',
      '3. Choose Concern Category: Select from options like "Broken Lead Seal", "Scale Shows Non-Zero Starting Weight", "Refusal of Verification Certificate", or "Suspected Rigged Display".',
      '4. Upload Evidence: You can attach a photo of the scale, shop receipt, or bill.',
      '5. Immediate Enforcement: The complaint is assigned to the District Legal Metrology Enforcement Squad for unannounced surprise inspection under Section 30.',
    ],
    deepLinks: [
      { label: 'Report a Scale Concern Now', url: '/report-concern' },
      { label: 'Public Scale Verification', url: '/verify' },
    ],
    suggestedChips: [
      '🔍 How do I verify a scale with QR?',
      '🔒 What is a legal physical lead seal?',
      '⚖️ What is the Legal Metrology Act?',
    ],
  },

  // 9. INSTRUMENTS COVERED
  {
    id: 'instruments-covered',
    badge: '⚖️ Instrument Categories',
    keywords: [
      'instrument', 'instruments', 'scales', 'weighbridge', 'petrol pump', 
      'fuel dispenser', 'carat balance', 'gold scale', 'types of scale', 
      'what can be verified', 'measuring devices'
    ],
    title: 'Instruments Regulated Under MESUREGX',
    answer: `MESUREGX covers the complete spectrum of commercial and statutory measuring instruments in India:`,
    bullets: [
      '⚖️ Non-Automatic Weighing Instruments: Electronic counter balances, grocery scales, platform scales, hanging scales (Class III & IV).',
      '🚛 Heavy Industrial Weighbridges: 20-tonne to 120-tonne pitless/pit weighbridges used in mandis, sugar factories, and transport hubs.',
      '⛽ Petroleum Dispensers: Multi-nozzle petrol, diesel, and CNG dispensing units with certified 5L / 10L proving measures.',
      '💎 High-Precision Balances: Bullion carat scales (Class I & II) with 0.01 mg readability used in jewelry and pharmaceutical labs.',
      '💧 Flow Meters & Bulk Measures: Industrial flow meters, bulk oil tankers, and pipeline meters.',
      '📏 Linear & Length Measures: Fabric meters, steel measuring tapes, and surveyors chains.',
    ],
    deepLinks: [
      { label: 'Register an Instrument', url: '/business/instruments' },
    ],
    suggestedChips: [
      '📝 How do I apply for verification?',
      '💰 How are verification fees calculated?',
      '⚖️ Who is the Legal Metrology Officer?',
    ],
  },

  // 10. USER ROLES ON PORTAL
  {
    id: 'portal-user-roles',
    badge: '👥 Portal User Roles',
    keywords: [
      'roles', 'user roles', 'who can use', 'types of users', 'business owner', 
      'gatc', 'admin', 'trader account', 'officer account', 'portal access'
    ],
    title: 'User Roles & Access Levels on MESUREGX',
    answer: `MESUREGX provides role-based access tailored to each stakeholder in the legal metrology ecosystem:`,
    bullets: [
      '🏪 Business Owner / Trader: Self-registers instruments, applies for initial and periodic verification, pays statutory fees, and downloads official Form VIII certificates with QR stickers.',
      '⚖️ Legal Metrology Officer (LMO): Conducts field audits, validates OIML tolerance math, records GPS geo-tagged lead seals, and issues digital approvals.',
      '🔬 GATC Accredited Test Lab: Certified government test laboratories performing specialized testing on heavy instruments, weighbridges, and bulk meters.',
      '🏛️ State & District Admin: Department directors managing officer rosters, audit trails, statutory rules, fee schedules, and compliance dashboards.',
      '👥 General Citizen / Consumer: Free public access to verify any shop scale QR code and report scale cheating without registration.',
    ],
    deepLinks: [
      { label: 'Register as Business Owner', url: '/register' },
      { label: 'Public Scale Verification', url: '/verify' },
    ],
    suggestedChips: [
      '⚖️ Tell me more about the Officer role',
      '📝 How do I apply as a trader?',
      '🔍 How do citizens verify scales?',
    ],
  },

  // 11. GENERAL WHAT IS MESUREGX
  {
    id: 'what-is-mesuregx',
    badge: '🎯 Platform Overview',
    keywords: [
      'what is mesuregx', 'about mesuregx', 'overview', 'idea', 'explain portal', 
      'what does portal do', 'why mesuregx', 'mission', 'purpose'
    ],
    title: 'What is MESUREGX?',
    answer: `MESUREGX is India\'s Next-Generation Digital Verification and Stamping Ecosystem for the Department of Legal Metrology.\n\nDesigned under the Legal Metrology Act, 2009, it replaces slow paper-based calibration with instant digital verification, automated OIML R 76-1 tolerance calculations, satellite GPS geo-tagged physical lead sealing, and tamper-proof QR code certificates for consumer protection.`,
    bullets: [
      '⚡ 100% Paperless & Transparent: Traders apply online, pay statutory fees, and receive verifiable certificates.',
      '🔒 Anti-Counterfeiting: Eliminates fake calibration stickers using physical lead seals linked to unique digital QR hashes.',
      '📱 Village Offline Resilience: Officers can verify scales in remote rural markets with zero internet signal.',
      '🛡️ Citizen Protection: Any shopper can scan a vendor\'s scale QR code to verify calibration accuracy in real-time.',
    ],
    deepLinks: [
      { label: 'Explore Portal Features', url: '/#features' },
      { label: 'Apply for Verification', url: '/business/applications/new' },
    ],
    suggestedChips: [
      '📝 How do I apply for verification?',
      '⚖️ What does an officer do?',
      '🔍 How to verify a scale QR code?',
      '💰 How are fees calculated?',
    ],
  },
];

/**
 * Intelligent Conversational Query Matcher
 * Uses weighted multi-token semantic overlap to find the best match
 * and avoids misfiring on single generic words like "officer" or "scale".
 */
export function queryKnowledgeBase(input) {
  if (!input || typeof input !== 'string') {
    return getFallbackResponse();
  }

  const rawClean = input.toLowerCase().trim();
  if (rawClean.length === 0) {
    return getFallbackResponse();
  }

  // Greeting Detection
  if (/^(hi|hello|hey|namaste|greetings|good morning|good afternoon|good evening|vanakkam)\b/i.test(rawClean)) {
    return {
      type: 'GREETING',
      badge: '👋 Assistant Welcome',
      title: 'Namaste! I am Mesuri, your Metrology AI Guide',
      answer: `Hello! I am here to help you navigate every corner of the MESUREGX Portal — from understanding how Legal Metrology Officers inspect instruments, to applying for verification, calculating fees, and checking scale QR codes.`,
      bullets: [
        'How can I help you today? You can ask me anything about the portal or choose one of the topics below:',
      ],
      suggestedChips: [
        '⚖️ Who is the Legal Metrology Officer?',
        '📝 How do I apply for scale verification?',
        '💰 How are verification fees calculated?',
        '🔍 How to verify a scale QR code?',
        '🔒 What is physical lead sealing?',
        '🎯 What is MESUREGX?',
      ],
    };
  }

  // Stopwords to ignore in weighted matching
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'and', 'or', 'to', 'for', 'in', 
    'on', 'at', 'by', 'with', 'about', 'can', 'you', 'i', 'me', 'my', 'what', 'how', 
    'when', 'where', 'why', 'who', 'please', 'tell', 'show', 'give', 'know', 'help', 'do', 'does'
  ]);

  const queryWords = rawClean
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  let bestTopic = null;
  let highestScore = 0;

  for (const topic of STATUTORY_TOPICS) {
    let score = 0;

    // Check exact keyword phrase matches (highest priority)
    for (const kw of topic.keywords) {
      if (rawClean.includes(kw)) {
        score += kw.split(' ').length * 6; // Multi-word keyword gets high bonus
      }
    }

    // Check word-by-word overlap in topic title & answer
    const topicText = `${topic.title} ${topic.answer} ${topic.keywords.join(' ')}`.toLowerCase();
    for (const w of queryWords) {
      if (topicText.includes(w)) {
        score += 2;
      }
    }

    // Specific domain boosting
    if (topic.id === 'officer-role-and-inspection') {
      if (rawClean.includes('officer') || rawClean.includes('inspector') || rawClean.includes('lmo')) {
        score += 8;
      }
    }

    if (topic.id === 'how-to-apply-verification') {
      if (rawClean.includes('apply') || rawClean.includes('application') || rawClean.includes('process')) {
        score += 6;
      }
    }

    if (topic.id === 'statutory-fees-and-challan') {
      if (rawClean.includes('fee') || rawClean.includes('cost') || rawClean.includes('price') || rawClean.includes('challan') || rawClean.includes('pay')) {
        score += 7;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestTopic = topic;
    }
  }

  // Minimum threshold for a confident match
  if (bestTopic && highestScore >= 5) {
    return {
      type: 'TOPIC_MATCH',
      badge: bestTopic.badge,
      title: bestTopic.title,
      answer: bestTopic.answer,
      bullets: bestTopic.bullets,
      links: bestTopic.deepLinks,
      suggestedChips: bestTopic.suggestedChips,
    };
  }

  // Fallback with intelligent suggestions
  return getFallbackResponse(rawClean);
}

function getFallbackResponse(query = '') {
  return {
    type: 'FALLBACK',
    badge: '💡 AI Guide Guidance',
    title: 'Let me help you with your question',
    answer: query 
      ? `I want to give you the most accurate explanation regarding "${query}". Here are the core topics I can guide you through:`
      : `I am your 24/7 MESUREGX AI Assistant. Here is what I can clarify for you:`,
    bullets: [
      '⚖️ Officer & Inspection: How the Legal Metrology Officer conducts field audits and tolerance testing.',
      '📝 Applying for Verification: Step-by-step trader guide for initial and periodic stamping.',
      '💰 Fees & Payments: How statutory fees are calculated and paid online or via Treasury Challan.',
      '🔍 Scale QR Verification: How consumers and citizens verify scale validity instantly.',
      '🔒 Physical Lead Sealing: Tamper-evident sealing rules and enforcement.',
      '🚨 Grievances & Cheating: How to report short-weighing or broken seals.',
    ],
    suggestedChips: [
      '⚖️ Who is the Legal Metrology Officer?',
      '📝 How do I apply for verification?',
      '💰 How are fees calculated?',
      '🔍 How to verify a scale QR code?',
      '📱 How does the mobile inspector app work?',
      '🎯 What is MESUREGX?',
    ],
  };
}
