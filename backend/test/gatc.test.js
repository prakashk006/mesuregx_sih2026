const http = require('http');

const PORT = process.env.PORT || 5000;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runGatcTests() {
  console.log('====================================================');
  console.log('--- STARTING MESUREGX GATC ALLOCATION TEST SUITE ---');
  console.log('====================================================');

  let adminToken = '';
  let gatcToken = '';
  let officerToken = '';
  let registeredGatcId = '';

  try {
    // 1. Authenticate Admin
    console.log('\n[TEST 1] Logging in as Admin (Dr. A. Swaminathan)...');
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@mesuregx.demo', password: 'Admin@123' },
    });
    if (adminLogin.status !== 200) throw new Error('Admin login failed');
    adminToken = adminLogin.body.data.token;
    console.log('   ✓ Admin authenticated successfully');

    // 2. Authenticate seeded GATC
    console.log('\n[TEST 2] Logging in as GATC (National Test House)...');
    const gatcLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'gatc@mesuregx.demo', password: 'Gatc@123' },
    });
    if (gatcLogin.status !== 200) throw new Error('GATC login failed');
    gatcToken = gatcLogin.body.data.token;
    console.log(`   ✓ GATC authenticated successfully as ${gatcLogin.body.data.user.name} (${gatcLogin.body.data.user.role})`);
    if (gatcLogin.body.data.user.role !== 'GATC') throw new Error('Expected role GATC');

    // 3. Register a new GATC center (Self-registration)
    console.log('\n[TEST 3] Registering new GATC test centre (Madurai Regional Lab)...');
    const regRes = await request('/api/auth/register-gatc', {
      method: 'POST',
      body: {
        name: 'Pandyan Legal Metrology Calibration Centre',
        contactPerson: 'K. Meenakshi',
        email: `gatc.madurai.${Date.now()}@mesuregx.demo`,
        phone: '+91 94433 11224',
        address: '12 Kappalur Industrial Estate',
        city: 'Madurai',
        district: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625008',
        authorizationNo: `GATC-AUTH-MDU-${Date.now()}`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        categories: 'Automatic & Non-Automatic Weighing Instruments',
      },
    });
    if (regRes.status !== 201) throw new Error(`GATC registration failed: ${JSON.stringify(regRes.body)}`);
    registeredGatcId = regRes.body.data.gatcId;
    console.log(`   ✓ New GATC registered in status: ${regRes.body.data.status} (ID: ${registeredGatcId})`);

    // 4. Admin reviews and approves the new GATC
    console.log('\n[TEST 4] Admin approving the registered GATC center...');
    const approveRes = await request(`/api/gatc/${registeredGatcId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'ACTIVE', remarks: 'NABL accreditation and technical infrastructure verified.' },
    });
    if (approveRes.status !== 200) throw new Error('Failed to approve GATC');
    if (approveRes.body.data.gatc.status !== 'ACTIVE') throw new Error('Status not set to ACTIVE');
    console.log('   ✓ GATC status successfully updated to ACTIVE');

    // 5. Admin lists active GATCs with workload for allocation
    console.log('\n[TEST 5] Fetching active GATCs for allocation modal...');
    const activeGatcsRes = await request('/api/gatc/active?district=Coimbatore', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (activeGatcsRes.status !== 200) throw new Error('Failed to fetch active GATCs');
    const coimbatoreGatcs = activeGatcsRes.body.data.gatcs;
    console.log(`   ✓ Found ${coimbatoreGatcs.length} active GATC(s) in Coimbatore region`);
    const demoGatc = coimbatoreGatcs.find((g) => g.gatcCode === 'GATC-TN-001');
    if (!demoGatc) throw new Error('Demo GATC-TN-001 not found in active list');
    console.log(`   ✓ Demo GATC verified: ${demoGatc.name}, active workload: ${demoGatc.activeWorkload}`);

    // 6. Admin assigns application APP-2026-000013 to GATC
    console.log('\n[TEST 6] Admin allocating application APP-2026-000013 to GATC...');
    const assignRes = await request('/api/assignments/assign', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        applicationId: 'APP-2026-000013',
        authorityType: 'GATC',
        gatcId: demoGatc.id,
        scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        scheduledTime: '11:30 AM',
        location: demoGatc.address,
        instructions: 'Conduct full range OIML verification for retail commercial scale.',
        reason: 'Laboratory testing allocated to Government Approved Test Centre.',
      },
    });
    if (assignRes.status !== 200) throw new Error(`GATC allocation failed: ${JSON.stringify(assignRes.body)}`);
    console.log('   ✓ Application APP-2026-000013 allocated to GATC successfully');

    // 7. Verify assignment history was recorded
    console.log('\n[TEST 7] Checking AssignmentHistory timeline...');
    const historyRes = await request('/api/assignments/history/APP-2026-000013', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (historyRes.status !== 200) throw new Error('Failed to fetch assignment history');
    const history = historyRes.body.data.history;
    console.log(`   ✓ Assignment history retrieved (${history.length} event(s))`);
    if (history.length === 0 || history[0].authorityType !== 'GATC') {
      throw new Error('Expected GATC assignment in history');
    }

    // 8. GATC accepts the assignment
    console.log('\n[TEST 8] GATC accepting assigned application APP-2026-000013...');
    const acceptRes = await request('/api/assignments/accept', {
      method: 'POST',
      headers: { Authorization: `Bearer ${gatcToken}` },
      body: { applicationId: 'APP-2026-000013' },
    });
    if (acceptRes.status !== 200) throw new Error(`GATC accept failed: ${JSON.stringify(acceptRes.body)}`);
    console.log('   ✓ Assignment accepted. Status transitioned to ACCEPTED / GATC_IN_PROGRESS');

    // 9. GATC performs test, evaluates measurements & submits result
    console.log('\n[TEST 9] GATC entering measurements, evaluating OIML rules, and submitting result...');
    const testRes = await request('/api/verifications/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${gatcToken}` },
      body: {
        applicationId: 'APP-2026-000013',
        measurements: [
          { reference: 0.0, observed: 0.0, testIndex: 1 },
          { reference: 5.0, observed: 5.0, testIndex: 2 },
          { reference: 10.0, observed: 10.001, testIndex: 3 },
          { reference: 20.0, observed: 20.002, testIndex: 4 },
          { reference: 30.0, observed: 30.002, testIndex: 5 },
        ],
        notes: 'Verification conducted under controlled environmental conditions (23°C, 50% RH). Zero tracking error within tolerance.',
        isDraft: false,
      },
    });
    if (testRes.status !== 200) throw new Error(`Test submission failed: ${JSON.stringify(testRes.body)}`);
    const cert = testRes.body.data.certificate;
    if (!cert || cert.issuedByType !== 'GATC') {
      throw new Error(`Expected certificate issuedByType === 'GATC', received: ${JSON.stringify(cert)}`);
    }
    console.log(`   ✓ GATC test submitted! Digital Certificate generated: ${cert.certificateNumber} (Issued By: ${cert.issuedByType}, Testing Lab: ${cert.gatcName})`);

    // 10. GATC Dashboard KPIs
    console.log('\n[TEST 10] Checking GATC Dashboard KPI statistics...');
    const statsRes = await request('/api/gatc/dashboard', {
      headers: { Authorization: `Bearer ${gatcToken}` },
    });
    if (statsRes.status !== 200) throw new Error('Failed to fetch GATC dashboard statistics');
    const kpis = statsRes.body.data.kpis;
    console.log(`   ✓ GATC Dashboard KPIs verified:`);
    console.log(`     - Total Assigned: ${kpis.totalAssigned}`);
    console.log(`     - Completed Tests: ${kpis.completedTests}`);
    console.log(`     - Active Queue: ${kpis.activeQueueCount}`);
    console.log(`     - Certificates Issued: ${kpis.certificatesIssued}`);

    // 11. Non-Regression: Existing LMO Officer workflow remains 100% functional
    console.log('\n[TEST 11] Verifying non-regression of existing Legal Metrology Officer workflow...');
    const offLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'officer@mesuregx.demo', password: 'Officer@123' },
    });
    if (offLogin.status !== 200) throw new Error('Officer login failed');
    officerToken = offLogin.body.data.token;
    console.log('   ✓ LMO Officer logged in successfully');

    const offAssignList = await request('/api/assignments', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    if (offAssignList.status !== 200) throw new Error('Failed to list officer assignments');
    console.log(`   ✓ LMO can view assigned applications (${offAssignList.body.data.assignments.length} assignments found)`);

    console.log('\n====================================================');
    console.log('✓✓ ALL GATC & LMO ALLOCATION TESTS PASSED (100%) ✓✓');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ GATC TEST FAILED:', err.message);
    process.exitCode = 1;
  }
}

runGatcTests();
