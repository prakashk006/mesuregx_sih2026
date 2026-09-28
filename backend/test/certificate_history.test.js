process.env.NODE_ENV = 'test';
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

async function runTests() {
  console.log('======================================================');
  console.log('  STARTING MESUREGX CERTIFICATE REPOSITORY & HISTORY TESTS');
  console.log('======================================================\n');

  try {
    process.env.NODE_ENV = 'test';
    server = app.listen(PORT);
    await new Promise((r) => setTimeout(r, 600));

    // 1. Authenticate Business Owner & Officer
    console.log('1. Authenticating Business Owner & Officer...');
    const bizAuth = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'business@mesuregx.demo', password: 'Business@123' },
    });
    const bizToken = bizAuth.body.data.token;
    console.log('   ✓ Business authenticated');

    const officerAuth = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'officer@mesuregx.demo', password: 'Officer@123' },
    });
    const officerToken = officerAuth.body.data.token;
    console.log('   ✓ Officer authenticated');

    // 2. Test GET /api/certificates (Repository List with stats & pagination)
    console.log('\n2. Testing GET /api/certificates for Business Owner...');
    const certList = await request('/api/certificates', {
      headers: { Authorization: `Bearer ${bizToken}` },
    });
    console.log('   Status:', certList.status, '| Total count:', certList.body.data?.pagination?.total);
    console.log('   Stats:', JSON.stringify(certList.body.data?.stats));
    if (certList.status !== 200 || !certList.body.data?.certificates) {
      throw new Error('Failed to retrieve certificates for business');
    }
    console.log('   ✓ Business certificate repository listing passed');

    // 3. Test Search & Filter on Repository
    console.log('\n3. Testing Certificate Search by keyword ("CERT-2026")...');
    const searchRes = await request('/api/certificates?search=CERT-2026', {
      headers: { Authorization: `Bearer ${bizToken}` },
    });
    console.log('   Search Results count:', searchRes.body.data?.certificates?.length);
    if (searchRes.status !== 200) throw new Error('Search failed');
    console.log('   ✓ Search passed');

    // 4. Test Single Certificate Detail with Relations
    console.log('\n4. Testing GET /api/certificates/:id...');
    const firstCert = certList.body.data.certificates[0];
    const certDetail = await request(`/api/certificates/${firstCert.id}`, {
      headers: { Authorization: `Bearer ${bizToken}` },
    });
    console.log('   Status:', certDetail.status, '| Cert No:', certDetail.body.data?.certificate?.certificateNumber);
    console.log('   Status:', certDetail.body.data?.certificate?.status);
    console.log('   Issued by:', certDetail.body.data?.certificate?.authority);
    if (certDetail.status !== 200) throw new Error('Failed to retrieve single certificate');
    console.log('   ✓ Certificate detail passed');

    // 5. Test Certificate History & Succession
    console.log('\n5. Testing GET /api/certificates/:id/history...');
    const historyRes = await request(`/api/certificates/${firstCert.id}/history`, {
      headers: { Authorization: `Bearer ${bizToken}` },
    });
    console.log('   Status:', historyRes.status);
    console.log('   Instrument:', historyRes.body.data?.instrument?.customId);
    console.log('   Current Cert ID:', historyRes.body.data?.currentCertificate?.certificateNumber);
    console.log('   Historical count:', historyRes.body.data?.historicalCertificates?.length);
    console.log('   Timeline events count:', historyRes.body.data?.timeline?.length);
    if (historyRes.status !== 200 || !historyRes.body.data?.timeline) {
      throw new Error('Failed to retrieve certificate history');
    }
    console.log('   ✓ Certificate history endpoint passed');

    // 6. Test Instrument Certificate History endpoint
    console.log('\n6. Testing GET /api/instruments/:id/certificates...');
    const instId = firstCert.instrumentId;
    const instHistory = await request(`/api/instruments/${instId}/certificates`, {
      headers: { Authorization: `Bearer ${bizToken}` },
    });
    console.log('   Status:', instHistory.status, '| Total Certificates for instrument:', instHistory.body.data?.certificates?.length);
    if (instHistory.status !== 200) throw new Error('Failed to get instrument certificates');
    console.log('   ✓ Instrument certificate history passed');

    // 7. Test Public Verification with History & Succession
    console.log('\n7. Testing Public Verification (/api/public/verify/:certNo)...');
    const pubVerify = await request(`/api/public/verify/${firstCert.certificateNumber}`);
    console.log('   Status:', pubVerify.status, '| Valid:', pubVerify.body.data?.valid, '| Status Badge:', pubVerify.body.data?.statusBadge);
    console.log('   Public history count:', pubVerify.body.data?.history?.length);
    if (pubVerify.status !== 200 || !pubVerify.body.data?.history) {
      throw new Error('Public verification failed or missing history array');
    }
    console.log('   ✓ Public verification with sanitized history passed');

    // 8. Test GATC Certificate Support
    console.log('\n8. Testing GATC Certificate Retrieval by Officer...');
    const officerCerts = await request('/api/certificates?authority=GATC', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    console.log('   GATC certs found:', officerCerts.body.data?.certificates?.length);
    if (officerCerts.status !== 200) throw new Error('GATC filter query failed');
    console.log('   ✓ GATC filter & authority handling passed');

    console.log('\n======================================================');
    console.log('  ALL CERTIFICATE REPOSITORY & HISTORY TESTS PASSED!  ');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
}

runTests();
