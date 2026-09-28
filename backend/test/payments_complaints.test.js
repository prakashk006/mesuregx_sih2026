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

function patch(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'PATCH',
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

async function runTests() {
  console.log('=== VERIFYING PAYMENTS & COMPLAINTS WORKFLOW ===\n');

  // Step 1: Login Business Owner
  console.log('1. Authenticating Business Owner...');
  const bRes = await post('/api/auth/login', { email: 'business@mesuregx.demo', password: 'Business@123' });
  if (bRes.status !== 200) throw new Error('Business login failed: ' + JSON.stringify(bRes));
  const bToken = bRes.data.data.token;
  console.log('   ✓ Logged in as:', bRes.data.data.user.name);

  // Step 2: Pay Demo Treasury Fee
  console.log('2. Processing Demo Treasury Fee Payment...');
  const payRes = await post('/api/payments/pay-demo', {
    applicationId: 'APP-2026-000013',
    paymentMethod: 'GOV_TREASURY_NETBANKING',
    bankReference: 'E-CHALLAN-TEST-99'
  }, bToken);
  if (payRes.status !== 201 && payRes.status !== 200) throw new Error('Payment failed: ' + JSON.stringify(payRes));
  console.log('   ✓ Payment Recorded:', payRes.data.data.payment.receiptNumber, '| Amount:', payRes.data.data.payment.amount);

  // Step 3: List Business Payments
  console.log('3. Fetching Business Treasury Records...');
  const bPayments = await get('/api/payments', bToken);
  if (bPayments.status !== 200 || !bPayments.data.data.payments.length) throw new Error('Failed to retrieve payments');
  console.log('   ✓ Payments count:', bPayments.data.data.payments.length);

  // Step 4: Submit Anonymous / Public Grievance
  console.log('4. Submitting Public Grievance Report...');
  const compRes = await post('/api/complaints', {
    reporterName: 'A. Citizen',
    reporterEmail: 'citizen@example.org',
    reporterPhone: '+91 98765 43210',
    category: 'SHORT_WEIGHING',
    description: 'When buying 1kg sugar, scale display jumps directly to 950g. Suspected unsealed weight manipulation.',
    location: 'City Bazaar Vendor 4'
  });
  if (compRes.status !== 201) throw new Error('Complaint submission failed: ' + JSON.stringify(compRes));
  const compNumber = compRes.data.data.complaint.complaintNumber;
  const compId = compRes.data.data.complaint.id;
  console.log('   ✓ Grievance Logged:', compNumber, '| Status:', compRes.data.data.complaint.status);

  // Step 5: Authenticate Admin & Inspect Grievance Oversight
  console.log('5. Authenticating Admin for Oversight...');
  const aRes = await post('/api/auth/login', { email: 'admin@mesuregx.demo', password: 'Admin@123' });
  if (aRes.status !== 200) throw new Error('Admin login failed');
  const aToken = aRes.data.data.token;

  const aComplaints = await get('/api/complaints', aToken);
  if (aComplaints.status !== 200) throw new Error('Admin failed to get complaints');
  console.log('   ✓ Admin retrieved complaints:', aComplaints.data.data.complaints.length);

  // Step 6: Authenticate Officer & Update Complaint Investigation
  console.log('6. Authenticating Legal Metrology Officer...');
  const oRes = await post('/api/auth/login', { email: 'officer@mesuregx.demo', password: 'Officer@123' });
  if (oRes.status !== 200) throw new Error('Officer login failed');
  const oToken = oRes.data.data.token;

  console.log('7. Officer Updating Investigation Notes & Resolving...');
  const updateRes = await patch(`/api/complaints/${compId}`, {
    status: 'RESOLVED',
    investigationNotes: 'Conducted surprise spot audit with calibrated 1kg M1 working standard. Scale calibration error of 48g confirmed. Device seized for re-verification under Section 15.',
    resolutionSummary: 'Violating scale confiscated and compounding fee notice issued. Matter closed.'
  }, oToken);
  if (updateRes.status !== 200) throw new Error('Officer failed to update complaint: ' + JSON.stringify(updateRes));
  console.log('   ✓ Complaint Status Updated to:', updateRes.data.data.complaint.status);

  console.log('\n=============================================================');
  console.log('  SUCCESS! PAYMENTS & COMPLAINTS WORKFLOW FULLY VERIFIED!   ');
  console.log('=============================================================\n');
}

runTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
