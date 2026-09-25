const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runAuthTests() {
  console.log('=== RUNNING AUTHENTICATION BACKEND SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `user_${timestamp}@example.com`;

  // Test 1: Register New Test User
  console.log(`[Test 1] POST /api/auth/register - Registering ${testEmail}...`);
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Test Navigator',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123',
    targetRole: 'Full Stack Web Developer'
  });

  console.log('Status:', regRes.status);
  console.log('Body:', regRes.data);
  const token = regRes.data.token;

  if (regRes.status !== 201 || !token || regRes.data.user.password) {
    console.error('❌ Test 1 FAILED! Token missing or password leaked.');
    process.exit(1);
  }
  console.log('✅ Test 1 PASSED: Registration successful, JWT received, password hidden.\n');

  // Test 2: Register Password Mismatch
  console.log('[Test 2] POST /api/auth/register - Mismatched passwords...');
  const mismatchRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Mismatch User',
    email: `mismatch_${timestamp}@example.com`,
    password: 'password123',
    confirmPassword: 'differentpassword'
  });
  console.log('Status:', mismatchRes.status, 'Message:', mismatchRes.data.message);
  if (mismatchRes.status !== 400) {
    console.error('❌ Test 2 FAILED! Expected 400 status for mismatched passwords.');
    process.exit(1);
  }
  console.log('✅ Test 2 PASSED: Password mismatch rejected.\n');

  // Test 3: Duplicate Email Validation
  console.log(`[Test 3] POST /api/auth/register - Duplicate Email (${testEmail})...`);
  const dupRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Test Navigator',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123'
  });
  console.log('Status:', dupRes.status, 'Message:', dupRes.data.message);
  if (dupRes.status !== 400) {
    console.error('❌ Test 3 FAILED! Expected 400 status for duplicate email.');
    process.exit(1);
  }
  console.log('✅ Test 3 PASSED: Duplicate email correctly rejected.\n');

  // Test 4: Invalid Login Credentials
  console.log('[Test 4] POST /api/auth/login - Invalid Password...');
  const invalidLoginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'wrongpassword'
  });
  console.log('Status:', invalidLoginRes.status, 'Message:', invalidLoginRes.data.message);
  if (invalidLoginRes.status !== 401) {
    console.error('❌ Test 4 FAILED! Expected 401 status for invalid credentials.');
    process.exit(1);
  }
  console.log('✅ Test 4 PASSED: Invalid login rejected.\n');

  // Test 5: Valid Login
  console.log('[Test 5] POST /api/auth/login - Valid Credentials...');
  const validLoginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'password123'
  });
  console.log('Status:', validLoginRes.status, 'User Role:', validLoginRes.data.user.role);
  if (validLoginRes.status !== 200 || !validLoginRes.data.token) {
    console.error('❌ Test 5 FAILED! Valid login did not return 200 & JWT token.');
    process.exit(1);
  }
  console.log('✅ Test 5 PASSED: Valid login succeeded, JWT returned.\n');

  // Test 6: GET /api/auth/me Protected Endpoint
  console.log('[Test 6] GET /api/auth/me - Protected Route with valid JWT...');
  const meRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Status:', meRes.status, 'User Name:', meRes.data.user?.name, 'Role:', meRes.data.user?.role);
  if (meRes.status !== 200 || !meRes.data.user || meRes.data.user.password) {
    console.error('❌ Test 6 FAILED! Unable to fetch user profile via JWT.');
    process.exit(1);
  }
  console.log('✅ Test 6 PASSED: Protected route returned authenticated user profile.\n');

  // Test 7: GET /api/auth/me without Token
  console.log('[Test 7] GET /api/auth/me - Protected Route without token...');
  const noTokenRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });
  console.log('Status:', noTokenRes.status, 'Message:', noTokenRes.data.message);
  if (noTokenRes.status !== 401) {
    console.error('❌ Test 7 FAILED! Protected route allowed unauthenticated request.');
    process.exit(1);
  }
  console.log('✅ Test 7 PASSED: Protected route blocked unauthenticated request.\n');

  console.log('🎉 ALL BACKEND AUTHENTICATION TESTS PASSED SUCCESSFULLY!');
}

runAuthTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
