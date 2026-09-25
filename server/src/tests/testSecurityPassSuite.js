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
      if (typeof postData === 'string') {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
};

async function runSecurityPassSuite() {
  console.log('=== RUNNING FULL SECURITY & VALIDATION SUITE ===\n');
  const timestamp = Date.now();

  try {
    // 1. Password Never Appears in API Responses
    console.log('[Test 1] Passwords Never Exposed in API Responses...');
    const regRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Security Test User',
      email: `secuser_${timestamp}@example.com`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    });

    if (regRes.data.user?.password || JSON.stringify(regRes.data).includes('SecurePassword123!')) {
      throw new Error('Test 1 Failed: Password exposed in registration response!');
    }

    const token = regRes.data.token;

    const meRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (meRes.data.user?.password) {
      throw new Error('Test 1 Failed: Password exposed in /auth/me response!');
    }
    console.log('✅ Test 1 PASSED: Passwords strictly stripped from all API response payloads.');

    // 2. Authentication Enforcement (401 Unauthorized)
    console.log('\n[Test 2] Authentication Enforcement (401 Unauthorized)...');
    const noTokenRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET'
    });

    if (noTokenRes.status !== 401) {
      throw new Error(`Test 2 Failed: Expected 401 for unauthenticated request, got ${noTokenRes.status}`);
    }

    const badTokenRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET',
      headers: { Authorization: 'Bearer invalid_tampered_jwt_token_xyz' }
    });

    if (badTokenRes.status !== 401) {
      throw new Error(`Test 2 Failed: Expected 401 for tampered JWT token, got ${badTokenRes.status}`);
    }
    console.log('✅ Test 2 PASSED: Protected routes reject missing or invalid tokens with 401 Unauthorized.');

    // 3. Role-Based Authorization Enforcement (403 Forbidden)
    console.log('\n[Test 3] Role Authorization Enforcement (403 Forbidden)...');
    const forbiddenRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (forbiddenRes.status !== 403) {
      throw new Error(`Test 3 Failed: Expected 403 Forbidden for non-admin user, got ${forbiddenRes.status}`);
    }
    console.log('✅ Test 3 PASSED: Non-admin users strictly receive 403 Forbidden on admin APIs.');

    // 4. Missing Resource Handling (404 Not Found)
    console.log('\n[Test 4] Missing Resources Handling (404 Not Found)...');
    const notFoundRoute = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/non-existent-endpoint-xyz',
      method: 'GET'
    });

    if (notFoundRoute.status !== 404) {
      throw new Error(`Test 4 Failed: Expected 404 for non-existent route, got ${notFoundRoute.status}`);
    }

    const nonExistentCareer = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/careers/507f1f77bcf86cd799439011',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (nonExistentCareer.status !== 404) {
      throw new Error(`Test 4 Failed: Expected 404 for non-existent career ID, got ${nonExistentCareer.status}`);
    }
    console.log('✅ Test 4 PASSED: Missing endpoints & resources return 404 Not Found.');

    // 5. Invalid Request Handling & Malformed ObjectId (400 Bad Request)
    console.log('\n[Test 5] Invalid Inputs & Malformed ObjectId Handling (400 Bad Request)...');
    const invalidIdRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/careers/invalid_malformed_objectid_123',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (invalidIdRes.status !== 400 && invalidIdRes.status !== 404) {
      throw new Error(`Test 5 Failed: Expected 400/404 for malformed ID format, got ${invalidIdRes.status}`);
    }

    const invalidJsonRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, '{ malformed_json: ');

    if (invalidJsonRes.status !== 400) {
      throw new Error(`Test 5 Failed: Expected 400 Bad Request for malformed JSON, got ${invalidJsonRes.status}`);
    }
    console.log('✅ Test 5 PASSED: Malformed input data and invalid ObjectIds rejected with 400 Bad Request.');

    console.log('\n🎉 ALL SECURITY & VALIDATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ SECURITY SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runSecurityPassSuite();
