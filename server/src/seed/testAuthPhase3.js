const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');

let server;
let baseUrl;

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsedData });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

let passedTests = 0;
let failedTests = 0;

const assert = (condition, testName, details = '') => {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details}`);
    failedTests++;
  }
};

const runPhase3Tests = async () => {
  console.log('🧪 Starting PHASE 3 Auth & Security Test Suite...\n');

  await connectDB();
  const seedData = require('./seedData');
  await seedData();

  // Start temporary HTTP server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`🌐 Test server listening on ${baseUrl}`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Successful Register
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Successful Register ---');
    const regRes = await request('POST', '/api/auth/register', {
      name: 'New Student',
      email: 'newstudent@example.com',
      password: 'Password@123'
    });
    assert(regRes.status === 201, 'HTTP 201 Created on Register', `(Got status: ${regRes.status})`);
    assert(regRes.body.success === true && regRes.body.token, 'Token Returned on Register');
    assert(regRes.body.user.role === 'student', 'Registered User Assigned Role = Student');

    // -------------------------------------------------------------
    // TEST 2: Duplicate Email
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Duplicate Email ---');
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Duplicate Student',
      email: 'newstudent@example.com',
      password: 'Password@123'
    });
    assert(dupRes.status === 400, 'HTTP 400 Bad Request on Duplicate Email', `(Got status: ${dupRes.status})`);
    assert(dupRes.body.message.includes('already exists'), 'ErrorMessage mentions user already exists');

    // -------------------------------------------------------------
    // TEST 3: Invalid Email
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Invalid Email ---');
    const invalidEmailRes = await request('POST', '/api/auth/register', {
      name: 'Invalid Email User',
      email: 'invalid-email-format',
      password: 'Password@123'
    });
    assert(invalidEmailRes.status === 400, 'HTTP 400 Bad Request on Invalid Email', `(Got status: ${invalidEmailRes.status})`);

    // -------------------------------------------------------------
    // TEST 4: Weak Password
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Weak Password (<6 chars) ---');
    const weakPassRes = await request('POST', '/api/auth/register', {
      name: 'Weak Pass User',
      email: 'weakpass@example.com',
      password: '123'
    });
    assert(weakPassRes.status === 400, 'HTTP 400 Bad Request on Weak Password', `(Got status: ${weakPassRes.status})`);

    // -------------------------------------------------------------
    // TEST 5: Successful Login
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Successful Login ---');
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'student@smartskill.com',
      password: 'Student@123'
    });
    assert(loginRes.status === 200, 'HTTP 200 OK on Login', `(Got status: ${loginRes.status})`);
    assert(loginRes.body.token && loginRes.body.user.email === 'student@smartskill.com', 'Token and User returned on Login');
    const studentToken = loginRes.body.token;

    // -------------------------------------------------------------
    // TEST 6: Wrong Password
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Wrong Password ---');
    const wrongPassRes = await request('POST', '/api/auth/login', {
      email: 'student@smartskill.com',
      password: 'WrongPassword123'
    });
    assert(wrongPassRes.status === 401, 'HTTP 401 Unauthorized on Wrong Password', `(Got status: ${wrongPassRes.status})`);
    assert(wrongPassRes.body.message === 'Invalid email or password.', 'Generic error message for wrong password');

    // -------------------------------------------------------------
    // TEST 7: Nonexistent Email
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Nonexistent Email ---');
    const nonExistentRes = await request('POST', '/api/auth/login', {
      email: 'nonexistent99@smartskill.com',
      password: 'Password@123'
    });
    assert(nonExistentRes.status === 401, 'HTTP 401 Unauthorized on Nonexistent Email', `(Got status: ${nonExistentRes.status})`);
    assert(nonExistentRes.body.message === 'Invalid email or password.', 'Generic error message for nonexistent email');

    // -------------------------------------------------------------
    // TEST 8: Invalid JWT
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Invalid JWT Token ---');
    const invalidJwtRes = await request('GET', '/api/auth/me', null, {
      Authorization: 'Bearer fake_invalid_jwt_token_12345'
    });
    assert(invalidJwtRes.status === 401, 'HTTP 401 Unauthorized on Invalid JWT', `(Got status: ${invalidJwtRes.status})`);

    // -------------------------------------------------------------
    // TEST 9: Expired JWT
    // -------------------------------------------------------------
    console.log('\n--- Test 9: Expired JWT Token ---');
    const studentUser = await User.findOne({ email: 'student@smartskill.com' });
    const secret = process.env.JWT_SECRET || 'smartskill_jwt_secret_key_2026';
    const expiredToken = jwt.sign(
      { userId: studentUser._id.toString(), role: studentUser.role },
      secret,
      { expiresIn: '-10s' }
    );
    const expiredJwtRes = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${expiredToken}`
    });
    assert(expiredJwtRes.status === 401, 'HTTP 401 Unauthorized on Expired JWT', `(Got status: ${expiredJwtRes.status})`);
    assert(expiredJwtRes.body.message.includes('expired'), 'Expired token message returned');

    // -------------------------------------------------------------
    // TEST 10: No Token
    // -------------------------------------------------------------
    console.log('\n--- Test 10: No Token Provided ---');
    const noTokenRes = await request('GET', '/api/auth/me');
    assert(noTokenRes.status === 401, 'HTTP 401 Unauthorized on Missing Token', `(Got status: ${noTokenRes.status})`);

    // -------------------------------------------------------------
    // TEST 11: Student Accessing Admin API -> 403 Forbidden
    // -------------------------------------------------------------
    console.log('\n--- Test 11: Student Accessing Admin API ---');
    const studentAdminRes = await request('GET', '/api/admin/stats', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(studentAdminRes.status === 403, 'HTTP 403 Forbidden when Student calls Admin API', `(Got status: ${studentAdminRes.status})`);

    // -------------------------------------------------------------
    // TEST 12: Admin Accessing Admin API -> Allowed (200)
    // -------------------------------------------------------------
    console.log('\n--- Test 12: Admin Accessing Admin API ---');
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@smartskill.com',
      password: 'Admin@123'
    });
    const adminToken = adminLoginRes.body.token;
    const adminApiRes = await request('GET', '/api/admin/stats', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminApiRes.status === 200, 'HTTP 200 OK when Admin calls Admin API', `(Got status: ${adminApiRes.status})`);

    // -------------------------------------------------------------
    // TEST 13: Public Registration Attempting role=admin -> Forced Student
    // -------------------------------------------------------------
    console.log('\n--- Test 13: Public Registration Attempting role=admin ---');
    const hackRoleRes = await request('POST', '/api/auth/register', {
      name: 'Hacker Admin Candidate',
      email: 'hacker@example.com',
      password: 'Password@123',
      role: 'admin' // Attempt to inject admin role!
    });
    assert(hackRoleRes.status === 201, 'HTTP 201 Created on Register');
    assert(hackRoleRes.body.user.role === 'student', 'Public Registration Force-Assigned role = student');
    const dbHackerUser = await User.findOne({ email: 'hacker@example.com' });
    assert(dbHackerUser.role === 'student', 'DB Record Confirms role = student (Not Admin)');

    // -------------------------------------------------------------
    // TEST 14: Password & Hash Never Returned in Responses
    // -------------------------------------------------------------
    console.log('\n--- Test 14: Password & Hash Never Exposed ---');
    assert(regRes.body.user.password === undefined, 'Register response omits password');
    assert(loginRes.body.user.password === undefined, 'Login response omits password');

    const meRes = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(meRes.body.user.password === undefined, '/api/auth/me response omits password');

    // -------------------------------------------------------------
    // TEST 15: Rate Limiting on Login
    // -------------------------------------------------------------
    console.log('\n--- Test 15: Rate Limiting on Login ---');
    let hitRateLimit = false;
    // authLimiter max is 20, make 25 rapid calls
    for (let i = 0; i < 25; i++) {
      const rlRes = await request('POST', '/api/auth/login', {
        email: 'student@smartskill.com',
        password: 'WrongPassword'
      });
      if (rlRes.status === 429) {
        hitRateLimit = true;
        break;
      }
    }
    assert(hitRateLimit === true, 'Rate limiter triggers HTTP 429 Too Many Requests after threshold');

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 3 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 3 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL 15 PHASE 3 AUTHENTICATION & SECURITY TESTS PASSED!');
    }

  } catch (err) {
    console.error('❌ Error executing test suite:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    mongoose.connection.close();
  }
};

if (require.main === module) {
  runPhase3Tests();
}

module.exports = runPhase3Tests;
