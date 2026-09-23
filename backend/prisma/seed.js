const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MESUREGX database with realistic Legal Metrology demo data...');

  // Clean existing data in order of foreign key dependencies
  await prisma.enforcementEvidence.deleteMany({});
  await prisma.enforcementAction.deleteMany({});
  await prisma.enforcementCase.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.measurement.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.verificationApplication.deleteMany({});
  await prisma.instrument.deleteMany({});
  await prisma.verificationRule.deleteMany({});
  await prisma.instrumentType.deleteMany({});
  await prisma.officer.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const officerPassword = await bcrypt.hash('Officer@123', salt);
  const businessPassword = await bcrypt.hash('Business@123', salt);

  // 1. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mesuregx.demo',
      passwordHash: adminPassword,
      name: 'Dr. A. Swaminathan',
      phone: '+91 94431 20001',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. Officers
  const officerUser1 = await prisma.user.create({
    data: {
      email: 'officer@mesuregx.demo',
      passwordHash: officerPassword,
      name: 'R. Natarajan',
      phone: '+91 98422 10042',
      role: 'OFFICER',
      status: 'ACTIVE',
    },
  });

  const officer1 = await prisma.officer.create({
    data: {
      userId: officerUser1.id,
      officerCode: 'OFF-TN-042',
      name: 'R. Natarajan',
      email: 'officer@mesuregx.demo',
      phone: '+91 98422 10042',
      district: 'Coimbatore',
      designation: 'Senior Inspector of Legal Metrology',
      badgeNumber: 'LM-TN-CBE-042',
      status: 'ACTIVE',
    },
  });

  const officerUser2 = await prisma.user.create({
    data: {
      email: 'officer2@mesuregx.demo',
      passwordHash: officerPassword,
      name: 'Priya Sundaram',
      phone: '+91 98422 20018',
      role: 'OFFICER',
      status: 'ACTIVE',
    },
  });

  const officer2 = await prisma.officer.create({
    data: {
      userId: officerUser2.id,
      officerCode: 'OFF-TN-018',
      name: 'Priya Sundaram',
      email: 'officer2@mesuregx.demo',
      phone: '+91 98422 20018',
      district: 'Chennai',
      designation: 'Inspector of Legal Metrology',
      badgeNumber: 'LM-TN-CHN-018',
      status: 'ACTIVE',
    },
  });

  const officerUser3 = await prisma.user.create({
    data: {
      email: 'officer3@mesuregx.demo',
      passwordHash: officerPassword,
      name: 'K. Varma',
      phone: '+91 98422 30033',
      role: 'OFFICER',
      status: 'ACTIVE',
    },
  });

  const officer3 = await prisma.officer.create({
    data: {
      userId: officerUser3.id,
      officerCode: 'OFF-TN-033',
      name: 'K. Varma',
      email: 'officer3@mesuregx.demo',
      phone: '+91 98422 30033',
      district: 'Madurai',
      designation: 'Assistant Controller of Legal Metrology',
      badgeNumber: 'LM-TN-MDU-033',
      status: 'ACTIVE',
    },
  });

  // 3. Businesses
  const businessUser1 = await prisma.user.create({
    data: {
      email: 'business@mesuregx.demo',
      passwordHash: businessPassword,
      name: 'K. Ramanathan',
      phone: '+91 98940 12345',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
    },
  });

  const business1 = await prisma.business.create({
    data: {
      userId: businessUser1.id,
      businessName: 'Sri Lakshmi Stores',
      ownerName: 'K. Ramanathan',
      email: 'business@mesuregx.demo',
      mobile: '+91 98940 12345',
      address: '42 Cross Cut Road, Gandhipuram',
      city: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641012',
      businessType: 'Retail Grocery & Provisions',
      gstNumber: '33AABCL1234F1Z5',
    },
  });

  // Additional Businesses
  const businessUser2 = await prisma.user.create({
    data: {
      email: 'kovai.agro@mesuregx.demo',
      passwordHash: businessPassword,
      name: 'V. Sundaram',
      phone: '+91 94432 54321',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
    },
  });
  const business2 = await prisma.business.create({
    data: {
      userId: businessUser2.id,
      businessName: 'Kovai Agro Feeds & Mills',
      ownerName: 'V. Sundaram',
      email: 'kovai.agro@mesuregx.demo',
      mobile: '+91 94432 54321',
      address: '15 Palakkad Main Road',
      city: 'Pollachi',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '642001',
      businessType: 'Agricultural Wholesale',
      gstNumber: '33AABCK5678K1Z2',
    },
  });

  const businessUser3 = await prisma.user.create({
    data: {
      email: 'annamalai.tex@mesuregx.demo',
      passwordHash: businessPassword,
      name: 'S. Annamalai',
      phone: '+91 97890 67890',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
    },
  });
  const business3 = await prisma.business.create({
    data: {
      userId: businessUser3.id,
      businessName: 'Annamalai Tex & Weigh Hub',
      ownerName: 'S. Annamalai',
      email: 'annamalai.tex@mesuregx.demo',
      mobile: '+91 97890 67890',
      address: '88 Avinashi Road, Kumaran Nagar',
      city: 'Tiruppur',
      district: 'Tiruppur',
      state: 'Tamil Nadu',
      pincode: '641603',
      businessType: 'Textile Manufacturing',
      gstNumber: '33AABCA9012M1Z8',
    },
  });

  const businessUser4 = await prisma.user.create({
    data: {
      email: 'selvam.market@mesuregx.demo',
      passwordHash: businessPassword,
      name: 'R. Selvam',
      phone: '+91 98421 98765',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
    },
  });
  const business4 = await prisma.business.create({
    data: {
      userId: businessUser4.id,
      businessName: 'Selvam Supermarket & Provisions',
      ownerName: 'R. Selvam',
      email: 'selvam.market@mesuregx.demo',
      mobile: '+91 98421 98765',
      address: '104 DB Road, RS Puram',
      city: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641002',
      businessType: 'Supermarket',
      gstNumber: '33AABCS3456N1Z1',
    },
  });

  const businessUser5 = await prisma.user.create({
    data: {
      email: 'murugan.fuels@mesuregx.demo',
      passwordHash: businessPassword,
      name: 'M. Murugan',
      phone: '+91 99944 11223',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
    },
  });
  const business5 = await prisma.business.create({
    data: {
      userId: businessUser5.id,
      businessName: 'Murugan Fuel Station & Logistics',
      ownerName: 'M. Murugan',
      email: 'murugan.fuels@mesuregx.demo',
      mobile: '+91 99944 11223',
      address: '220 Trichy Road, Singanallur',
      city: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641005',
      businessType: 'Petroleum Retail Outlets',
      gstNumber: '33AABCM7890P1Z4',
    },
  });

  // 4. Instrument Types
  const typesData = [
    { code: 'WEIGHING_SCALE', name: 'Electronic Weighing Machine', desc: 'Non-automatic electronic counter weighing balance', validity: 12 },
    { code: 'PLATFORM_SCALE', name: 'Platform Scale', desc: 'Heavy-duty commercial & industrial platform scale', validity: 12 },
    { code: 'RETAIL_SCALE', name: 'Retail Weighing Scale', desc: 'Price-computing retail table scale', validity: 12 },
    { code: 'COUNTER_SCALE', name: 'Counter Scale', desc: 'Mechanical counter scale with standard weights', validity: 12 },
    { code: 'FUEL_DISPENSER', name: 'Fuel Dispenser', desc: 'Multi-nozzle digital petrol and diesel dispensing unit', validity: 12 },
    { code: 'MEASURING_CYLINDER', name: 'Measuring Cylinder', desc: 'Standard conical or cylindrical volumetric measure', validity: 24 },
    { code: 'LENGTH_MEASURE', name: 'Length Measuring Instrument', desc: 'Steel tape, meter scale, fabric measuring yardstick', validity: 24 },
    { code: 'WATER_METER', name: 'Water Meter', desc: 'Domestic and commercial cold potable water flow meter', validity: 24 },
    { code: 'ELECTRICITY_METER', name: 'Electricity Meter', desc: 'Static AC energy meter', validity: 36 },
  ];

  const typeMap = {};
  for (const t of typesData) {
    const created = await prisma.instrumentType.create({
      data: {
        code: t.code,
        name: t.name,
        description: t.desc,
        defaultValidityMonths: t.validity,
        isActive: true,
      },
    });
    typeMap[t.code] = created;
  }

  // 5. Verification Rules
  await prisma.verificationRule.create({
    data: {
      instrumentTypeId: typeMap['WEIGHING_SCALE'].id,
      accuracyClass: 'III',
      capacityMin: 0,
      capacityMax: 30,
      allowedErrorPercent: 0.3,
      allowedErrorAbsolute: 0.03,
      validityMonths: 12,
      isActive: true,
    },
  });

  await prisma.verificationRule.create({
    data: {
      instrumentTypeId: typeMap['PLATFORM_SCALE'].id,
      accuracyClass: 'III',
      capacityMin: 30,
      capacityMax: 500,
      allowedErrorPercent: 0.3,
      allowedErrorAbsolute: 0.15,
      validityMonths: 12,
      isActive: true,
    },
  });

  await prisma.verificationRule.create({
    data: {
      instrumentTypeId: typeMap['FUEL_DISPENSER'].id,
      accuracyClass: 'III',
      capacityMin: 0,
      capacityMax: 100,
      allowedErrorPercent: 0.3,
      allowedErrorAbsolute: 0.02,
      validityMonths: 12,
      isActive: true,
    },
  });

  // 6. Instruments (including WX-1001 for Sri Lakshmi Stores)
  const inst1 = await prisma.instrument.create({
    data: {
      customId: 'WX-1001',
      businessId: business1.id,
      typeId: typeMap['WEIGHING_SCALE'].id,
      manufacturer: 'Essae-Teraoka Ltd',
      model: 'DS-215 Commercial',
      serialNumber: 'ES-2024-98711',
      capacity: 30,
      capacityUnit: 'kg',
      accuracyClass: 'III',
      purchaseDate: new Date('2024-03-15'),
      installationLocation: 'Main Counter, Billing Desk 1',
      description: 'Dual display electronic weighing scale for grocery counter',
      status: 'VERIFIED',
    },
  });

  const inst2 = await prisma.instrument.create({
    data: {
      customId: 'WX-1002',
      businessId: business1.id,
      typeId: typeMap['PLATFORM_SCALE'].id,
      manufacturer: 'Avery India Ltd',
      model: 'H-300 Platform',
      serialNumber: 'AV-2023-45612',
      capacity: 150,
      capacityUnit: 'kg',
      accuracyClass: 'III',
      purchaseDate: new Date('2023-08-20'),
      installationLocation: 'Bulk Storage & Grain Inward Bay',
      description: 'Heavy duty platform scale for gunny bag verification',
      status: 'PENDING_VERIFICATION',
    },
  });

  const inst3 = await prisma.instrument.create({
    data: {
      customId: 'WX-1003',
      businessId: business2.id,
      typeId: typeMap['PLATFORM_SCALE'].id,
      manufacturer: 'Eagle Scales Pvt Ltd',
      model: 'EPL-500 Industrial',
      serialNumber: 'EG-2023-88231',
      capacity: 500,
      capacityUnit: 'kg',
      accuracyClass: 'III',
      purchaseDate: new Date('2023-01-10'),
      installationLocation: 'Cattle Feed Bagging Area',
      description: 'Warehouse bagging platform balance',
      status: 'VERIFIED',
    },
  });

  const inst4 = await prisma.instrument.create({
    data: {
      customId: 'WX-1004',
      businessId: business3.id,
      typeId: typeMap['WEIGHING_SCALE'].id,
      manufacturer: 'Mettler Toledo India',
      model: 'BBA231 Precision',
      serialNumber: 'MT-2024-11009',
      capacity: 15,
      capacityUnit: 'kg',
      accuracyClass: 'II',
      purchaseDate: new Date('2024-05-12'),
      installationLocation: 'Yarn Testing QC Lab',
      description: 'High precision yarn count inspection balance',
      status: 'PENDING_VERIFICATION',
    },
  });

  const inst5 = await prisma.instrument.create({
    data: {
      customId: 'FD-2001',
      businessId: business5.id,
      typeId: typeMap['FUEL_DISPENSER'].id,
      manufacturer: 'Tokheim India',
      model: 'Quantium 510 Multi-Product',
      serialNumber: 'TK-2023-77651',
      capacity: 60,
      capacityUnit: 'L',
      accuracyClass: 'III',
      purchaseDate: new Date('2023-11-05'),
      installationLocation: 'Island Bay 1 - MS (Petrol)',
      description: 'High speed retail motor spirit electronic dispenser',
      status: 'VERIFIED',
    },
  });

  const inst6 = await prisma.instrument.create({
    data: {
      customId: 'FD-2002',
      businessId: business5.id,
      typeId: typeMap['FUEL_DISPENSER'].id,
      manufacturer: 'Gilbarco Veeder-Root',
      model: 'SK700-II High Flow',
      serialNumber: 'GV-2023-99120',
      capacity: 80,
      capacityUnit: 'L',
      accuracyClass: 'III',
      purchaseDate: new Date('2023-11-05'),
      installationLocation: 'Island Bay 2 - HSD (Diesel)',
      description: 'Heavy vehicle diesel dispensing terminal',
      status: 'VERIFIED',
    },
  });

  const inst7 = await prisma.instrument.create({
    data: {
      customId: 'WX-1005',
      businessId: business4.id,
      typeId: typeMap['RETAIL_SCALE'].id,
      manufacturer: 'Essae-Teraoka Ltd',
      model: 'DS-652 Price Computing',
      serialNumber: 'ES-2024-33214',
      capacity: 15,
      capacityUnit: 'kg',
      accuracyClass: 'III',
      purchaseDate: new Date('2024-01-22'),
      installationLocation: 'Vegetable & Fruit Section',
      description: 'Retail barcode price calculating scale',
      status: 'VERIFIED',
    },
  });

  const inst8 = await prisma.instrument.create({
    data: {
      customId: 'WX-1006',
      businessId: business4.id,
      typeId: typeMap['COUNTER_SCALE'].id,
      manufacturer: 'Crown Metrology',
      model: 'CS-10 Commercial',
      serialNumber: 'CR-2022-55441',
      capacity: 10,
      capacityUnit: 'kg',
      accuracyClass: 'III',
      purchaseDate: new Date('2022-06-18'),
      installationLocation: 'Backstore Weighment',
      description: 'Mechanical dual pan counter scale with cast iron weights',
      status: 'REJECTED',
    },
  });

  const inst9 = await prisma.instrument.create({
    data: {
      customId: 'MC-3001',
      businessId: business2.id,
      typeId: typeMap['MEASURING_CYLINDER'].id,
      manufacturer: 'Borosil Scientific',
      model: 'Class A Conical 20L',
      serialNumber: 'BR-2023-12001',
      capacity: 20,
      capacityUnit: 'L',
      accuracyClass: 'I',
      purchaseDate: new Date('2023-04-10'),
      installationLocation: 'Oil Drum Dispensing Bay',
      description: 'Brass standard conical volumetric verification measure',
      status: 'VERIFIED',
    },
  });

  const inst10 = await prisma.instrument.create({
    data: {
      customId: 'WX-1007',
      businessId: business1.id,
      typeId: typeMap['WEIGHING_SCALE'].id,
      manufacturer: 'Crown Metrology',
      model: 'CP-30 Retail',
      serialNumber: 'CR-2024-99882',
      capacity: 30,
      capacityUnit: 'kg',
      accuracyClass: 'III',
      purchaseDate: new Date('2024-08-01'),
      installationLocation: 'Billing Counter 2',
      description: 'Vegetable counter electronic scale',
      status: 'PENDING_VERIFICATION',
    },
  });

  // 7. Applications & Verifications & Certificates
  // App 1: CERTIFICATE_ISSUED (Inst 1, WX-1001) - Demonstrates completed valid certificate
  const app1 = await prisma.verificationApplication.create({
    data: {
      applicationNumber: 'APP-2026-000001',
      businessId: business1.id,
      instrumentId: inst1.id,
      applicationType: 'Periodic Verification',
      preferredDate: new Date('2026-01-15'),
      location: '42 Cross Cut Road, Gandhipuram, Coimbatore',
      remarks: 'Annual re-verification for commercial grocery scale',
      status: 'CERTIFICATE_ISSUED',
      createdAt: new Date('2026-01-10T09:00:00Z'),
    },
  });

  const assignment1 = await prisma.assignment.create({
    data: {
      applicationId: app1.id,
      officerId: officer1.id,
      scheduledDate: new Date('2026-01-15T10:00:00Z'),
      scheduledTime: '10:30 AM',
      location: '42 Cross Cut Road, Gandhipuram, Coimbatore',
      instructions: 'Verify zero tracking and linearity at 5kg, 10kg, 20kg standards',
      status: 'COMPLETED',
    },
  });

  const verif1 = await prisma.verification.create({
    data: {
      applicationId: app1.id,
      officerId: officer1.id,
      verificationDate: new Date('2026-01-15T11:30:00Z'),
      latitude: 11.0168,
      longitude: 76.9558,
      locationAccuracy: 8.5,
      locationAddress: 'Cross Cut Road, Gandhipuram, Coimbatore - 641012',
      overallResult: 'PASS',
      notes: 'All standard test loads verified within legal limits. Lead seal attached on calibration switch.',
      status: 'REVIEWED',
    },
  });

  await prisma.measurement.createMany({
    data: [
      { verificationId: verif1.id, testNumber: 1, referenceValue: 5.0, observedValue: 5.01, error: 0.01, percentageError: 0.2, allowedError: 0.03, result: 'PASS', remarks: 'Within MPE' },
      { verificationId: verif1.id, testNumber: 2, referenceValue: 10.0, observedValue: 9.99, error: -0.01, percentageError: 0.1, allowedError: 0.03, result: 'PASS', remarks: 'Within MPE' },
      { verificationId: verif1.id, testNumber: 3, referenceValue: 20.0, observedValue: 20.01, error: 0.01, percentageError: 0.05, allowedError: 0.06, result: 'PASS', remarks: 'Within MPE' },
    ],
  });

  const cert1 = await prisma.certificate.create({
    data: {
      certificateNumber: 'CERT-2026-000001',
      applicationId: app1.id,
      instrumentId: inst1.id,
      businessId: business1.id,
      officerId: officer1.id,
      issueDate: new Date('2026-01-15T12:00:00Z'),
      expiryDate: new Date('2027-01-14T23:59:59Z'),
      status: 'VALID',
      qrCodeData: 'http://localhost:5173/verify/CERT-2026-000001',
      digitalSignature: 'SHA256-RSA:a9b8c7e6f5d4c3b2a10123456789abcdef9876543210',
    },
  });
  await prisma.instrument.update({ where: { id: inst1.id }, data: { currentCertificateId: cert1.id } });

  // App 2: SUBMITTED - Ready for Demo live assignment & field verification!
  const app2 = await prisma.verificationApplication.create({
    data: {
      applicationNumber: 'APP-2026-000002',
      businessId: business1.id,
      instrumentId: inst2.id,
      applicationType: 'Initial Verification',
      preferredDate: new Date('2026-09-25'),
      location: '42 Cross Cut Road, Bulk Storage Bay, Coimbatore',
      remarks: 'Newly procured 150kg platform scale for warehouse inward.',
      status: 'SUBMITTED',
      createdAt: new Date('2026-09-20T14:30:00Z'),
    },
  });

  // App 3: SCHEDULED / ASSIGNED
  const app3 = await prisma.verificationApplication.create({
    data: {
      applicationNumber: 'APP-2026-000003',
      businessId: business2.id,
      instrumentId: inst3.id,
      applicationType: 'Periodic Verification',
      preferredDate: new Date('2026-09-22'),
      location: '15 Palakkad Main Road, Pollachi',
      remarks: 'Annual calibration check for feed bagging balance.',
      status: 'ASSIGNED',
      createdAt: new Date('2026-09-18T10:15:00Z'),
    },
  });
  await prisma.assignment.create({
    data: {
      applicationId: app3.id,
      officerId: officer1.id,
      scheduledDate: new Date('2026-09-22T11:00:00Z'),
      scheduledTime: '11:00 AM',
      location: '15 Palakkad Main Road, Pollachi',
      instructions: 'Carry 50kg, 100kg cast iron block standards',
      status: 'PENDING',
    },
  });

  // App 4: FIELD_VERIFICATION in progress
  const app4 = await prisma.verificationApplication.create({
    data: {
      applicationNumber: 'APP-2026-000004',
      businessId: business3.id,
      instrumentId: inst4.id,
      applicationType: 'Special Verification',
      preferredDate: new Date('2026-09-21'),
      location: '88 Avinashi Road, Kumaran Nagar, Tiruppur',
      remarks: 'Post repair verification requested',
      status: 'FIELD_VERIFICATION',
      createdAt: new Date('2026-09-19T11:00:00Z'),
    },
  });
  await prisma.assignment.create({
    data: {
      applicationId: app4.id,
      officerId: officer1.id,
      scheduledDate: new Date('2026-09-21T14:00:00Z'),
      scheduledTime: '02:00 PM',
      location: '88 Avinashi Road, Kumaran Nagar, Tiruppur',
      instructions: 'Precision testing for Class II laboratory balance',
      status: 'IN_PROGRESS',
    },
  });

  // App 5: REJECTED application (demonstrates failure case in history)
  const app5 = await prisma.verificationApplication.create({
    data: {
      applicationNumber: 'APP-2026-000005',
      businessId: business4.id,
      instrumentId: inst8.id,
      applicationType: 'Periodic Verification',
      preferredDate: new Date('2026-08-10'),
      location: '104 DB Road, RS Puram, Coimbatore',
      remarks: 'Mechanical counter scale',
      status: 'REJECTED',
      rejectionReason: 'Knife-edge agate bearings worn out; zero error exceeds 12g (Allowable MPE: ±2g). Refurbishment required.',
      createdAt: new Date('2026-08-05T08:00:00Z'),
    },
  });

  // App 6: Valid Fuel Dispenser Certificate
  const app6 = await prisma.verificationApplication.create({
    data: {
      applicationNumber: 'APP-2026-000006',
      businessId: business5.id,
      instrumentId: inst5.id,
      applicationType: 'Periodic Verification',
      preferredDate: new Date('2026-02-01'),
      location: '220 Trichy Road, Singanallur, Coimbatore',
      remarks: 'Annual calibration for MS dispenser nozzle 1 & 2',
      status: 'CERTIFICATE_ISSUED',
      createdAt: new Date('2026-01-25T09:00:00Z'),
    },
  });
  const cert6 = await prisma.certificate.create({
    data: {
      certificateNumber: 'CERT-2026-000002',
      applicationId: app6.id,
      instrumentId: inst5.id,
      businessId: business5.id,
      officerId: officer1.id,
      issueDate: new Date('2026-02-01T14:00:00Z'),
      expiryDate: new Date('2027-01-31T23:59:59Z'),
      status: 'VALID',
      qrCodeData: 'http://localhost:5173/verify/CERT-2026-000002',
      digitalSignature: 'SHA256-RSA:f1e2d3c4b5a60718293a4b5c6d7e8f9012345678',
    },
  });

  // App 7: EXPIRING_SOON Certificate (Expires in 15 days)
  const app7 = await prisma.verificationApplication.create({
    data: {
      applicationNumber: 'APP-2026-000007',
      businessId: business4.id,
      instrumentId: inst7.id,
      applicationType: 'Periodic Verification',
      preferredDate: new Date('2025-10-06'),
      location: '104 DB Road, RS Puram, Coimbatore',
      remarks: 'Supermarket vegetable counter scale verification',
      status: 'CERTIFICATE_ISSUED',
      createdAt: new Date('2025-10-01T10:00:00Z'),
    },
  });
  const cert7 = await prisma.certificate.create({
    data: {
      certificateNumber: 'CERT-2025-000098',
      applicationId: app7.id,
      instrumentId: inst7.id,
      businessId: business4.id,
      officerId: officer1.id,
      issueDate: new Date('2025-10-06T11:00:00Z'),
      expiryDate: new Date('2026-10-05T23:59:59Z'), // ~14 days from simulated current date
      status: 'EXPIRING_SOON',
      qrCodeData: 'http://localhost:5173/verify/CERT-2025-000098',
      digitalSignature: 'SHA256-RSA:1234abcd5678ef90feeaabbccddeeff001122334',
    },
  });

  // App 8: EXPIRED Certificate (Historical)
  const app8 = await prisma.verificationApplication.create({
    data: {
      applicationNumber: 'APP-2025-000045',
      businessId: business2.id,
      instrumentId: inst9.id,
      applicationType: 'Initial Verification',
      preferredDate: new Date('2024-04-12'),
      location: '15 Palakkad Main Road, Pollachi',
      remarks: 'Conical volumetric measure verification',
      status: 'CERTIFICATE_ISSUED',
      createdAt: new Date('2024-04-05T10:00:00Z'),
    },
  });
  await prisma.certificate.create({
    data: {
      certificateNumber: 'CERT-2024-000045',
      applicationId: app8.id,
      instrumentId: inst9.id,
      businessId: business2.id,
      officerId: officer1.id,
      issueDate: new Date('2024-04-12T10:00:00Z'),
      expiryDate: new Date('2026-04-11T23:59:59Z'), // Expired months ago
      status: 'EXPIRED',
      qrCodeData: 'http://localhost:5173/verify/CERT-2024-000045',
      digitalSignature: 'SHA256-RSA:998877665544332211aabbccddeeff0011223344',
    },
  });

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: businessUser1.id,
        title: 'Certificate Issued for WX-1001',
        message: 'Digital Verification Certificate CERT-2026-000001 has been generated and is valid until Jan 14, 2027.',
        type: 'SUCCESS',
        isRead: false,
        link: '/business/certificates',
      },
      {
        userId: businessUser1.id,
        title: 'Application APP-2026-000002 Submitted',
        message: 'Your verification request for Platform Scale (WX-1002) has been queued for officer review.',
        type: 'INFO',
        isRead: true,
        link: '/business/applications',
      },
      {
        userId: officerUser1.id,
        title: 'New Verification Request: APP-2026-000002',
        message: 'Sri Lakshmi Stores submitted an initial verification request for Platform Scale in Coimbatore.',
        type: 'INFO',
        isRead: false,
        link: '/officer/applications',
      },
      {
        userId: officerUser1.id,
        title: 'Inspection Scheduled Today',
        message: 'Field verification scheduled for Annamalai Tex & Weigh Hub (APP-2026-000004) at 02:00 PM.',
        type: 'WARNING',
        isRead: false,
        link: '/officer/schedule',
      },
    ],
  });

  // 9. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userRole: 'ADMIN',
        action: 'SYSTEM_INITIALIZATION',
        entity: 'System',
        entityId: 'ROOT',
        description: 'MESUREGX Legal Metrology verification platform initialized with standard rules.',
      },
      {
        userId: businessUser1.id,
        userRole: 'BUSINESS_OWNER',
        action: 'BUSINESS_REGISTERED',
        entity: 'Business',
        entityId: business1.id,
        description: 'Business "Sri Lakshmi Stores" registered by K. Ramanathan (Coimbatore).',
      },
      {
        userId: businessUser1.id,
        userRole: 'BUSINESS_OWNER',
        action: 'INSTRUMENT_CREATED',
        entity: 'Instrument',
        entityId: inst1.id,
        description: 'Measuring instrument WX-1001 (Essae Electronic Weighing Machine 30kg) registered.',
      },
      {
        userId: businessUser1.id,
        userRole: 'BUSINESS_OWNER',
        action: 'APPLICATION_SUBMITTED',
        entity: 'Application',
        entityId: app1.id,
        description: 'Verification Application APP-2026-000001 submitted for WX-1001.',
      },
      {
        userId: officerUser1.id,
        userRole: 'OFFICER',
        action: 'OFFICER_ASSIGNED',
        entity: 'Assignment',
        entityId: assignment1.id,
        description: 'Inspector R. Natarajan assigned to inspection for APP-2026-000001.',
      },
      {
        userId: officerUser1.id,
        userRole: 'OFFICER',
        action: 'VERIFICATION_STARTED',
        entity: 'Verification',
        entityId: verif1.id,
        description: 'Field inspection started at GPS [11.0168, 76.9558].',
      },
      {
        userId: officerUser1.id,
        userRole: 'OFFICER',
        action: 'MEASUREMENT_SUBMITTED',
        entity: 'Measurement',
        entityId: verif1.id,
        description: '3 test measurements evaluated via Legal Metrology Rule Engine. Result: PASS.',
      },
      {
        userId: officerUser1.id,
        userRole: 'OFFICER',
        action: 'APPLICATION_APPROVED',
        entity: 'Application',
        entityId: app1.id,
        description: 'Application APP-2026-000001 approved by Inspector R. Natarajan.',
      },
      {
        userId: officerUser1.id,
        userRole: 'OFFICER',
        action: 'CERTIFICATE_ISSUED',
        entity: 'Certificate',
        entityId: cert1.id,
        description: 'Digital Verification Certificate CERT-2026-000001 generated with secure QR payload.',
      },
    ],
  });

  // 10. Seed Realistic Enforcement Cases
  console.log('Seeding Enforcement Cases and Statutory Actions...');
  const enfCase1 = await prisma.enforcementCase.create({
    data: {
      caseNumber: 'ENF-2026-000001',
      businessId: business1.id,
      instrumentId: inst1.id,
      applicationId: app1.id,
      certificateId: cert1.id,
      officerId: officer1.id,
      violationType: 'Expired Verification',
      priority: 'High',
      status: 'NOTICE_ISSUED',
      location: '124 Cross Cut Road, Gandhipuram, Coimbatore',
      district: 'Coimbatore',
      detectedDate: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      followUpDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      remarks: 'Periodic re-verification lapsed by 18 days. Physical device continued in commercial trade without current re-stamping seal.',
      observations: 'Electronic counter scale found displaying weight without valid annual verification seal. Merchant claimed pending vendor technician visit.',
      actions: {
        create: [
          {
            actionType: 'Notice Issued',
            description: 'Statutory Notice under Section 24 of Legal Metrology Act issued. Mandated verification within 7 working days.',
            officerId: officer1.id,
            officerName: 'R. Natarajan',
            actionDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
            status: 'COMPLETED',
          },
          {
            actionType: 'Follow-up Required',
            description: 'Surprise compliance re-audit scheduled for next week.',
            officerId: officer1.id,
            officerName: 'R. Natarajan',
            actionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
            status: 'PENDING',
          },
        ],
      },
      evidence: {
        create: [
          {
            evidenceType: 'INSTRUMENT_PHOTO',
            fileName: 'scale_seal_expired_photo.jpg',
            filePath: '/uploads/sample-evidence.jpg',
            mimeType: 'image/jpeg',
            fileSize: 420000,
            notes: 'Front fascia photo showing expired seal badge date.',
          },
          {
            evidenceType: 'OBSERVATION',
            fileName: 'field_inspection_memo.pdf',
            filePath: '/uploads/sample-memo.pdf',
            mimeType: 'application/pdf',
            fileSize: 185000,
            notes: 'Field officer spot check inspection record memorandum.',
          },
        ],
      },
    },
  });

  const enfCase2 = await prisma.enforcementCase.create({
    data: {
      caseNumber: 'ENF-2026-000002',
      businessId: business2.id,
      instrumentId: inst2.id,
      officerId: officer1.id,
      violationType: 'Tampering/Irregularity',
      priority: 'Critical',
      status: 'VIOLATION_CONFIRMED',
      location: '15 Palakkad Main Road, Pollachi, Coimbatore',
      district: 'Coimbatore',
      detectedDate: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      followUpDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      remarks: 'Lead verification seal wire found cut and calibration potentiometer accessible. Scale tested under-weighing by 42g on 20kg nominal weight.',
      observations: 'Severe metrological violation under Section 26. Instrument confiscated for laboratory re-calibration.',
      actions: {
        create: [
          {
            actionType: 'Correction Required',
            description: 'Immediate cessation of commercial use ordered. Seizure memo prepared.',
            officerId: officer1.id,
            officerName: 'R. Natarajan',
            actionDate: new Date(Date.now() - 4 * 24 * 3600 * 1000),
            status: 'COMPLETED',
          },
          {
            actionType: 'Re-inspection',
            description: 'Laboratory forensic tolerance test scheduled at Zonal Standards Laboratory.',
            officerId: officer1.id,
            officerName: 'R. Natarajan',
            actionDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
            status: 'PENDING',
          },
        ],
      },
      evidence: {
        create: [
          {
            evidenceType: 'SEAL_VERIFICATION',
            fileName: 'broken_seal_evidence.jpg',
            filePath: '/uploads/broken-seal.jpg',
            mimeType: 'image/jpeg',
            fileSize: 610000,
            notes: 'Close-up photograph showing cut seal wire and missing official monogram stamp.',
          },
        ],
      },
    },
  });

  const enfCase3 = await prisma.enforcementCase.create({
    data: {
      caseNumber: 'ENF-2026-000003',
      businessId: business3.id,
      instrumentId: inst3.id,
      officerId: officer2.id,
      violationType: 'Non-Compliant Instrument',
      priority: 'Medium',
      status: 'INSPECTION_REQUIRED',
      location: '88 Avinashi Road, Kumaran Nagar, Tiruppur',
      district: 'Tiruppur',
      detectedDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      followUpDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
      remarks: 'Unapproved model variation installed on industrial weighbridge platform without Model Approval Certificate.',
      observations: 'Weighbridge load cells replaced with non-certified Chinese load sensors without prior intimation to Department.',
      actions: {
        create: [
          {
            actionType: 'Warning / Notice',
            description: 'Show-cause notice served to produce OIML / Model Approval documentation.',
            officerId: officer2.id,
            officerName: 'Priya Sundaram',
            actionDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
            status: 'COMPLETED',
          },
        ],
      },
    },
  });

  const enfCase4 = await prisma.enforcementCase.create({
    data: {
      caseNumber: 'ENF-2026-000004',
      businessId: business4.id,
      instrumentId: inst4.id,
      officerId: officer1.id,
      violationType: 'Incorrect Display',
      priority: 'Low',
      status: 'FOLLOW_UP',
      location: '104 DB Road, RS Puram, Coimbatore',
      district: 'Coimbatore',
      detectedDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      followUpDate: new Date(Date.now() + 1 * 24 * 3600 * 1000),
      remarks: 'Customer-facing secondary display unit intermittent and illegible during billing.',
      observations: 'Customer display cable loose; trader agreed to replace display module within 48 hours.',
      actions: {
        create: [
          {
            actionType: 'Correction Required',
            description: 'Secondary display repair mandated.',
            officerId: officer1.id,
            officerName: 'R. Natarajan',
            actionDate: new Date(Date.now() - 9 * 24 * 3600 * 1000),
            status: 'COMPLETED',
          },
        ],
      },
    },
  });

  const enfCase5 = await prisma.enforcementCase.create({
    data: {
      caseNumber: 'ENF-2026-000005',
      businessId: business5.id,
      officerId: officer1.id,
      violationType: 'Failed Verification',
      priority: 'High',
      status: 'ACTION_PENDING',
      location: '220 Trichy Road, Singanallur, Coimbatore',
      district: 'Coimbatore',
      detectedDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      remarks: 'Fuel dispensing unit nozzle #3 failed 5-liter volumetric measure tolerance test by +35ml error.',
      observations: 'Meter calibration drift detected in high-speed diesel dispenser nozzle.',
      actions: {
        create: [
          {
            actionType: 'Warning / Notice',
            description: 'Nozzle tagged out of service with official red lock-out seal.',
            officerId: officer1.id,
            officerName: 'R. Natarajan',
            actionDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
            status: 'COMPLETED',
          },
        ],
      },
    },
  });

  const enfCase6 = await prisma.enforcementCase.create({
    data: {
      caseNumber: 'ENF-2026-000006',
      businessId: business1.id,
      officerId: officer1.id,
      violationType: 'Missing Certificate',
      priority: 'Low',
      status: 'RESOLVED',
      location: 'Gandhipuram, Coimbatore',
      district: 'Coimbatore',
      detectedDate: new Date(Date.now() - 15 * 24 * 3600 * 1000),
      resolutionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      remarks: 'Original verification certificate not framed and displayed in prominent public view at checkout.',
      observations: 'Merchant produced certificate from safe and has now framed and mounted it conspicuously next to cash counter.',
      actions: {
        create: [
          {
            actionType: 'Case Resolution',
            description: 'Merchant complied with Section 24 certificate display norms. Compliance verified by inspector.',
            officerId: officer1.id,
            officerName: 'R. Natarajan',
            actionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
            status: 'COMPLETED',
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
  console.log('Demo Accounts:');
  console.log('  Admin:    admin@mesuregx.demo / Admin@123');
  console.log('  Officer:  officer@mesuregx.demo / Officer@123');
  console.log('  Business: business@mesuregx.demo / Business@123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
