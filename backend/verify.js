const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING END-TO-END API VERIFICATION ---');

  try {
    // 1. Register a test station user
    console.log('\n[TEST 1] Registering a new station user...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'station_test@bloodbank.org',
        password: 'password123',
        role: 'station',
        entity_name: 'Test Red Cross Station Bole'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    console.log('SUCCESS! Registration pending admin approval:', regData.user.email);

    // 2. Login as Admin
    console.log('\n[TEST 2] Logging in as Administrator...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bloodbank.org',
        password: 'admin123'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
    console.log('SUCCESS! Admin logged in.');
    const adminToken = adminLoginData.token;

    // 3. Approve the test station
    console.log('\n[TEST 3] Admin approving test station...');
    const approveRes = await fetch(`${BASE_URL}/admin/users/${regData.user.id}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const approveData = await approveRes.json();
    if (!approveRes.ok) throw new Error(`Approval failed: ${JSON.stringify(approveData)}`);
    console.log('SUCCESS! Station approved status:', approveData.user.status);

    // 4. Log in as the test station
    console.log('\n[TEST 4] Logging in as test station...');
    const stationLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'station_test@bloodbank.org',
        password: 'password123'
      })
    });
    const stationLoginData = await stationLoginRes.json();
    if (!stationLoginRes.ok) throw new Error(`Station login failed: ${JSON.stringify(stationLoginData)}`);
    console.log('SUCCESS! Station logged in.');
    const stationToken = stationLoginData.token;

    // 5. Query FAYDA ID ET-001 (eligible donor)
    console.log('\n[TEST 5] Station querying FAYDA Registry for ET-001...');
    const faydaRes = await fetch(`${BASE_URL}/fayda/ET-001`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stationToken}`
      }
    });
    const faydaData = await faydaRes.json();
    if (!faydaRes.ok) throw new Error(`FAYDA query failed: ${JSON.stringify(faydaData)}`);
    console.log('SUCCESS! FAYDA registry found:', faydaData.donor.name);
    console.log('Eligibility message:', faydaData.eligibility.message);

    // 6. Register a donation for ET-001 (sets last_donation_date to current date)
    console.log('\n[TEST 6] Station registering donation event for ET-001...');
    const donateRes = await fetch(`${BASE_URL}/station/donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stationToken}`
      },
      body: JSON.stringify(faydaData.donor)
    });
    const donateData = await donateRes.json();
    if (!donateRes.ok) throw new Error(`Donation registration failed: ${JSON.stringify(donateData)}`);
    console.log('SUCCESS! Registered donation event date:', donateData.donor.last_donation_date);

    // 7. Query FAYDA ID ET-001 again (verify 3-month ineligible status)
    console.log('\n[TEST 7] Querying FAYDA again to verify 3-month block...');
    const faydaRes2 = await fetch(`${BASE_URL}/fayda/ET-001`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stationToken}`
      }
    });
    const faydaData2 = await faydaRes2.json();
    if (!faydaRes2.ok) throw new Error(`Second FAYDA query failed: ${JSON.stringify(faydaData2)}`);
    console.log('SUCCESS! Expected 3-month warning caught:');
    console.log('Is Eligible?', faydaData2.eligibility.is_eligible);
    console.log('Message:', faydaData2.eligibility.message);

    console.log('\n--- ALL API INTEGRATION TESTS PASSED ---');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
