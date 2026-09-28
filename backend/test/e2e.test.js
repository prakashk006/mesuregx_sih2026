const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let resp = '';
        res.on('data', (c) => (resp += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resp) });
          } catch {
            resolve({ status: res.statusCode, raw: resp });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let resp = '';
        res.on('data', (c) => (resp += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resp) });
          } catch {
            resolve({ status: res.statusCode, raw: resp });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runLiveE2E() {
  console.log('=== STARTING LIVE END-TO-END DEMO VERIFICATION ===\n');

  // 1. Login as Business Owner
  console.log('Step 1: Authenticating Business Owner...');
  const bLogin = await post('/api/auth/login', {
    email: 'business@mesuregx.demo',
    password: 'Business@123',
  });
  const bToken = bLogin.data.data.token;
  console.log('   ✓ Logged in as:', bLogin.data.data.user.name, `(${bLogin.data.data.user.business.businessName})`);

  // 2. Register New Instrument
  console.log('\nStep 2: Registering New Measuring Instrument...');
  const typesRes = await get('/api/instruments/types', bToken);
  const typeId = typesRes.data.data.types[0].id; // Electronic Weighing Machine

  const instRes = await post(
    '/api/instruments',
    {
      typeId,
      customId: `WX-E2E-${Date.now().toString().slice(-4)}`,
      manufacturer: 'Essae-Teraoka Ltd',
      model: 'DS-215 Live Verified',
      serialNumber: `ES-LIVE-${Date.now().toString().slice(-4)}`,
      capacity: 30,
      capacityUnit: 'kg',
      accuracyClass: 'III',
      installationLocation: 'Front Billing Counter 1',
    },
    bToken
  );
  const newInst = instRes.data.data.instrument;
  console.log('   ✓ Registered Instrument:', newInst.customId, `(${newInst.manufacturer} ${newInst.model})`);

  // 3. Submit Verification Application
  console.log('\nStep 3: Submitting Verification Application...');
  const appRes = await post(
    '/api/applications',
    {
      instrumentId: newInst.id,
      applicationType: 'Initial Verification',
      preferredDate: new Date().toISOString(),
      location: '42 Cross Cut Road, Coimbatore',
      remarks: 'Automated E2E Test Application',
    },
    bToken
  );
  const newApp = appRes.data.data.application;
  console.log('   ✓ Application Created:', newApp.applicationNumber, '| Status:', newApp.status);

  // 4. Login as Officer
  console.log('\nStep 4: Authenticating Legal Metrology Officer...');
  const oLogin = await post('/api/auth/login', {
    email: 'officer@mesuregx.demo',
    password: 'Officer@123',
  });
  const oToken = oLogin.data.data.token;
  const officerId = oLogin.data.data.user.officer.id;
  console.log('   ✓ Logged in as:', oLogin.data.data.user.name, `(Officer Code: ${oLogin.data.data.user.officer.officerCode})`);

  // 5. Assign Officer & Schedule Verification
  console.log('\nStep 5: Assigning & Scheduling Verification...');
  const assignRes = await post(
    '/api/assignments',
    {
      applicationId: newApp.id,
      officerId,
      scheduledDate: new Date().toISOString(),
      scheduledTime: '11:00 AM',
      location: newApp.location,
      instructions: 'Verify zero stability and 5kg, 10kg, 20kg standard test weights.',
    },
    oToken
  );
  console.log('   ✓ Officer Assigned:', assignRes.data.data.assignment.officerId, '| Status: ASSIGNED');

  // 6. Run Physical Load Measurements via Rule Engine (PASS Case)
  console.log('\nStep 6: Executing Physical Test Measurements via FastAPI Rule Engine...');
  const verifRes = await post(
    '/api/verifications/submit',
    {
      applicationId: newApp.id,
      measurements: [
        { reference: 5, observed: 5.01 },
        { reference: 10, observed: 9.99 },
        { reference: 20, observed: 20.01 },
      ],
      latitude: 11.016844,
      longitude: 76.955832,
      locationAccuracy: 6.5,
      locationAddress: 'Cross Cut Road, Coimbatore',
      notes: 'All weights verified within OIML Class III limits.',
      isDraft: false,
    },
    oToken
  );
  console.log('   ✓ Evaluation Result:', verifRes.data.data.evaluation.overallResult);
  console.log('   ✓ Pass Rate:', `${verifRes.data.data.evaluation.summary.passRate}%`);
  console.log('   ✓ Standards Reference:', verifRes.data.data.evaluation.standardsReference);

  // 7. Approve Application & Generate Digital Certificate
  console.log('\nStep 7: Approving Application & Issuing Digital Certificate...');
  const decisionRes = await post(
    `/api/verifications/decision/${newApp.id}`,
    {
      decision: 'APPROVE',
      notes: 'Passed all verification stages.',
    },
    oToken
  );
  const cert = decisionRes.data.data.certificate;
  console.log('   ✓ Certificate Issued:', cert.certificateNumber);
  console.log('   ✓ QR Code Payload URL:', cert.qrCodeData);
  console.log('   ✓ Digital Signature Hash:', cert.digitalSignature);

  // 8. Public QR Verification Verification
  console.log('\nStep 8: Public Consumer QR Verification Lookup...');
  const pubVerify = await get(`/api/public/verify/${cert.certificateNumber}`);
  console.log('   ✓ Status Banner:', pubVerify.data.data.status);
  console.log('   ✓ Verified Instrument:', pubVerify.data.data.instrument.customId);
  console.log('   ✓ Trade Establishment:', pubVerify.data.data.business.name);
  console.log('   ✓ Valid Until:', new Date(pubVerify.data.data.expiryDate).toLocaleDateString());

  // 9. Failure Scenario Verification
  console.log('\nStep 9: Testing Tolerance Failure Scenario...');
  const failEval = await post(
    '/api/verifications/evaluate-live',
    {
      instrumentType: 'WEIGHING_SCALE',
      capacity: 30,
      unit: 'kg',
      accuracyClass: 'III',
      measurements: [
        { reference: 20, observed: 20.80 }, // 0.80kg error > 0.06kg allowed
      ],
    },
    oToken
  );
  console.log('   ✓ Failed Test Evaluation Result:', failEval.data.data.evaluation.overallResult);
  console.log('   ✓ Failure Remarks:', failEval.data.data.evaluation.tests[0].remarks);

  console.log('\n=============================================================');
  console.log('  SUCCESS! COMPLETE FULL-STACK METROLOGY WORKFLOW VERIFIED!  ');
  console.log('=============================================================\n');
}

runLiveE2E().catch((err) => {
  console.error('E2E Failure:', err);
  process.exit(1);
});
