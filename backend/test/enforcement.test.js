const http = require('http');
const app = require('../src/server');

let server;
const PORT = 5098;

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

async function runEnforcementTests() {
  console.log('--- STARTING MESUREGX ENFORCEMENT MODULE AUTOMATED TESTS ---');

  server = app.listen(PORT);
  let officerToken = '';
  let adminToken = '';
  let businessToken = '';
  let testCaseId = '';

  try {
    // 1. Authenticate Officer
    console.log('\n1. Logging in as Legal Metrology Officer...');
    const offLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'officer@mesuregx.demo', password: 'Officer@123' },
    });
    if (offLogin.status !== 200) throw new Error('Officer login failed');
    officerToken = offLogin.body.data.token;
    console.log('   ✓ Officer logged in successfully');

    // 2. Authenticate Admin
    console.log('\n2. Logging in as Admin...');
    const admLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@mesuregx.demo', password: 'Admin@123' },
    });
    if (admLogin.status !== 200) throw new Error('Admin login failed');
    adminToken = admLogin.body.data.token;
    console.log('   ✓ Admin logged in successfully');

    // 3. Authenticate Business
    console.log('\n3. Logging in as Business Owner...');
    const bizLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'business@mesuregx.demo', password: 'Business@123' },
    });
    if (bizLogin.status !== 200) throw new Error('Business login failed');
    businessToken = bizLogin.body.data.token;
    console.log('   ✓ Business owner logged in successfully');

    // 4. Test GET /api/enforcement/stats
    console.log('\n4. Testing GET /api/enforcement/stats (Real Data Aggregator)...');
    const statsRes = await request('/api/enforcement/stats', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    console.log('   Status:', statsRes.status, '| Open:', statsRes.body.data?.openCases, '| Total:', statsRes.body.data?.totalCases);
    if (statsRes.status !== 200 || typeof statsRes.body.data?.openCases !== 'number') {
      throw new Error('Enforcement stats endpoint failed');
    }
    console.log('   ✓ Enforcement stats verified');

    // 5. Test GET /api/enforcement/linkable-records
    console.log('\n5. Testing GET /api/enforcement/linkable-records (Zero-Duplication Records)...');
    const linkRes = await request('/api/enforcement/linkable-records', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    if (linkRes.status !== 200 || !linkRes.body.data?.instruments?.length) {
      throw new Error('Linkable records failed');
    }
    console.log(`   ✓ Found ${linkRes.body.data.instruments.length} instruments, ${linkRes.body.data.applications.length} applications`);

    // 6. Test POST /api/enforcement (Create Case)
    console.log('\n6. Testing POST /api/enforcement (Create New Case Linked to Real Instrument)...');
    const sampleInst = linkRes.body.data.instruments[0];
    const createRes = await request('/api/enforcement', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: {
        businessId: sampleInst.businessId,
        instrumentId: sampleInst.id,
        violationType: 'Non-Compliant Instrument',
        priority: 'High',
        location: 'Coimbatore Wholesale Hub',
        district: 'Coimbatore',
        remarks: 'Automated test violation registered during inspection.',
        initialActionType: 'Warning / Notice',
        initialActionDescription: 'Notice served to correct scale calibration.',
      },
    });
    console.log('   Status:', createRes.status, '| Case Number:', createRes.body.data?.caseNumber);
    if (createRes.status !== 201 || !createRes.body.data?.id) {
      throw new Error('Failed to create enforcement case');
    }
    testCaseId = createRes.body.data.id;
    console.log('   ✓ Case created successfully with ID:', testCaseId);

    // 7. Test GET /api/enforcement/:id (Dossier & Timeline)
    console.log('\n7. Testing GET /api/enforcement/:id (Full Dossier)...');
    const getRes = await request(`/api/enforcement/${testCaseId}`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    if (getRes.status !== 200 || getRes.body.data?.caseNumber !== createRes.body.data.caseNumber) {
      throw new Error('Get case by ID failed');
    }
    console.log('   ✓ Dossier loaded with linked instrument:', getRes.body.data?.linkedInstrument?.customId);

    // 8. Test PUT /api/enforcement/:id/status (Lifecycle Progression)
    console.log('\n8. Testing PUT /api/enforcement/:id/status (Advancing to VIOLATION_CONFIRMED)...');
    const statusRes = await request(`/api/enforcement/${testCaseId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: {
        status: 'VIOLATION_CONFIRMED',
        remarks: 'Physical laboratory test confirmed 35g deviation.',
        priority: 'Critical',
      },
    });
    if (statusRes.status !== 200 || statusRes.body.data?.status !== 'VIOLATION_CONFIRMED') {
      throw new Error('Status progression failed');
    }
    console.log('   ✓ Status advanced to VIOLATION_CONFIRMED');

    // 9. Test POST /api/enforcement/:id/actions (Record Action)
    console.log('\n9. Testing POST /api/enforcement/:id/actions (Re-inspection Action)...');
    const actionRes = await request(`/api/enforcement/${testCaseId}/actions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: {
        actionType: 'Re-inspection',
        description: 'Re-inspection mandated after technician recalibration.',
        followUpDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      },
    });
    if (actionRes.status !== 201 || !actionRes.body.data?.id) {
      throw new Error('Record action failed');
    }
    console.log('   ✓ Action recorded successfully');

    // 10. Test Mobile Field Sync
    console.log('\n10. Testing POST /api/enforcement/:id/mobile-sync (Mobile Field Inspection Sync)...');
    const syncRes = await request(`/api/enforcement/${testCaseId}/mobile-sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: {
        status: 'RESOLVED',
        observations: 'On-site field verification test confirmed calibrated scale with tolerance < 1g.',
        remarks: 'Merchant completed recalibration. Official stamp applied.',
        latitude: 11.0168,
        longitude: 76.9558,
        actionType: 'Case Resolution',
        actionDescription: 'Compliance verified by mobile inspection console.',
      },
    });
    if (syncRes.status !== 200 || syncRes.body.data?.status !== 'RESOLVED') {
      throw new Error('Mobile sync failed');
    }
    console.log('   ✓ Mobile field inspection sync succeeded; Case status is RESOLVED');

    // 11. Test Analytics
    console.log('\n11. Testing GET /api/enforcement/analytics...');
    const anaRes = await request('/api/enforcement/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (anaRes.status !== 200 || !anaRes.body.data?.violationsByType) {
      throw new Error('Analytics endpoint failed');
    }
    console.log(`   ✓ Analytics returned: ${anaRes.body.data.districtWiseCases.length} districts, ${anaRes.body.data.violationsByType.length} violation categories`);

    // 12. Test Permissions Security
    console.log('\n12. Testing Public / Unauthorized Access Restriction...');
    const unauthRes = await request('/api/enforcement');
    if (unauthRes.status !== 401) {
      throw new Error('Security check failed: unauthenticated access should return 401');
    }
    console.log('   ✓ Unauthenticated request rejected with HTTP 401 Unauthorized');

    console.log('\n======================================================');
    console.log('  ALL MESUREGX ENFORCEMENT TESTS PASSED SUCCESSFULLY!  ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Enforcement Test Failed:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    process.exit(0);
  }
}

runEnforcementTests();
