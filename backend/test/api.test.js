const http = require('http');
const app = require('../src/server');

let server;
const PORT = 5099;

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

async function runTests() {
  console.log('--- STARTING MESUREGX BACKEND API AUTOMATED TESTS ---');

  server = app.listen(PORT);
  let businessToken = '';
  let officerToken = '';
  let adminToken = '';

  try {
    // 1. Health Check
    console.log('\n1. Testing GET /api/health...');
    const health = await request('/api/health');
    console.log('   Status:', health.status, '| Response:', health.body);
    if (health.status !== 200 || health.body.status !== 'ok') throw new Error('Health check failed');
    console.log('   ✓ Health check passed');

    // 2. Business Login
    console.log('\n2. Testing Business Owner Login (business@mesuregx.demo)...');
    const bizLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'business@mesuregx.demo', password: 'Business@123' },
    });
    console.log('   Status:', bizLogin.status, '| User:', bizLogin.body.data?.user?.name, '| Role:', bizLogin.body.data?.user?.role);
    if (bizLogin.status !== 200 || !bizLogin.body.data?.token) throw new Error('Business login failed');
    businessToken = bizLogin.body.data.token;
    console.log('   ✓ Business login passed');

    // 3. Officer Login
    console.log('\n3. Testing Officer Login (officer@mesuregx.demo)...');
    const offLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'officer@mesuregx.demo', password: 'Officer@123' },
    });
    console.log('   Status:', offLogin.status, '| Officer:', offLogin.body.data?.user?.officer?.name, '| Code:', offLogin.body.data?.user?.officer?.officerCode);
    if (offLogin.status !== 200 || !offLogin.body.data?.token) throw new Error('Officer login failed');
    officerToken = offLogin.body.data.token;
    console.log('   ✓ Officer login passed');

    // 4. Admin Login
    console.log('\n4. Testing Admin Login (admin@mesuregx.demo)...');
    const admLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@mesuregx.demo', password: 'Admin@123' },
    });
    console.log('   Status:', admLogin.status, '| Admin:', admLogin.body.data?.user?.name);
    if (admLogin.status !== 200 || !admLogin.body.data?.token) throw new Error('Admin login failed');
    adminToken = admLogin.body.data.token;
    console.log('   ✓ Admin login passed');

    // 5. Public Certificate Verification (CERT-2026-000001)
    console.log('\n5. Testing Public Certificate Verification (/api/public/verify/CERT-2026-000001)...');
    const pubCert = await request('/api/public/verify/CERT-2026-000001');
    console.log('   Status:', pubCert.status, '| Status Badge:', pubCert.body.data?.status, '| Instrument:', pubCert.body.data?.instrument?.customId);
    if (pubCert.status !== 200 || pubCert.body.data?.status !== 'VALID') throw new Error('Public certificate verification failed');
    console.log('   ✓ Public verification passed with status VALID');

    // 6. Business Instruments List
    console.log('\n6. Testing GET /api/instruments with Business Token...');
    const instList = await request('/api/instruments', {
      headers: { Authorization: `Bearer ${businessToken}` },
    });
    console.log('   Status:', instList.status, '| Total Instruments:', instList.body.data?.instruments?.length);
    if (instList.status !== 200 || instList.body.data?.instruments?.length === 0) throw new Error('Instrument listing failed');
    console.log('   ✓ Instrument listing passed');

    // 7. Live Measurement Evaluation
    console.log('\n7. Testing POST /api/verifications/evaluate-live...');
    const evalRes = await request('/api/verifications/evaluate-live', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: {
        instrumentType: 'WEIGHING_SCALE',
        capacity: 30,
        unit: 'kg',
        accuracyClass: 'III',
        measurements: [
          { reference: 5, observed: 5.01 },
          { reference: 10, observed: 9.99 },
          { reference: 20, observed: 20.01 },
        ],
      },
    });
    console.log('   Status:', evalRes.status, '| Overall Result:', evalRes.body.data?.evaluation?.overallResult);
    if (evalRes.status !== 200 || evalRes.body.data?.evaluation?.overallResult !== 'PASS') throw new Error('Measurement evaluation failed');
    console.log('   ✓ Measurement evaluation PASS verified');

    // 8. Admin Dashboard Stats
    console.log('\n8. Testing GET /api/admin/dashboard...');
    const adminStats = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('   Status:', adminStats.status, '| Businesses:', adminStats.body.data?.stats?.totalBusinesses, '| Pass Rate:', `${adminStats.body.data?.stats?.passRate}%`);
    if (adminStats.status !== 200) throw new Error('Admin stats failed');
    console.log('   ✓ Admin stats passed');

    console.log('\n======================================================');
    console.log('  ALL MESUREGX BACKEND API TESTS PASSED SUCCESSFULLY! ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

runTests();
