const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');
const Resource = require('../models/Resource');
const Assessment = require('../models/Assessment');
const Project = require('../models/Project');

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

const runPhase11Tests = async () => {
  console.log('🧪 Starting PHASE 11 Admin Dashboard & Management Security Test Suite...\n');

  await connectDB();

  let attempts = 0;
  while (mongoose.connection.readyState !== 1 && attempts < 50) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }

  // Start temporary HTTP server
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
    // SETUP: Admin & Student Accounts
    // -------------------------------------------------------------
    const regAdmin = await request('POST', '/api/auth/register', {
      name: 'P11 Admin User',
      email: 'admin_p11@smartskill.com',
      password: 'Password@123'
    });
    const adminUser = await User.findOne({ email: 'admin_p11@smartskill.com' });
    adminUser.role = 'admin';
    await adminUser.save();

    const loginAdmin = await request('POST', '/api/auth/login', {
      email: 'admin_p11@smartskill.com',
      password: 'Password@123'
    });
    const adminToken = loginAdmin.body.token;

    const regStudent = await request('POST', '/api/auth/register', {
      name: 'P11 Student User',
      email: 'student_p11@smartskill.com',
      password: 'Password@123'
    });
    const studentToken = regStudent.body.token;
    const studentUser = await User.findOne({ email: 'student_p11@smartskill.com' });

    assert(adminToken && studentToken, 'Created test accounts for Admin and Student');

    // -------------------------------------------------------------
    // TEST 1: No Token -> 401 Unauthorized
    // -------------------------------------------------------------
    console.log('\n--- 1. No Token Security Check ---');
    const noTokenRes = await request('GET', '/api/admin/stats');
    assert(noTokenRes.status === 401, 'HTTP 401 Unauthorized on GET /api/admin/stats without token');

    // -------------------------------------------------------------
    // TEST 2: Student Token -> 403 Forbidden
    // -------------------------------------------------------------
    console.log('\n--- 2. Student Token Security Check ---');
    const studentRes = await request('GET', '/api/admin/stats', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(studentRes.status === 403, 'HTTP 403 Forbidden on Student calling GET /api/admin/stats');

    // -------------------------------------------------------------
    // TEST 3: Admin Token -> 200 Allowed
    // -------------------------------------------------------------
    console.log('\n--- 3. Admin Token Access Check ---');
    const adminStatsRes = await request('GET', '/api/admin/stats', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminStatsRes.status === 200, 'HTTP 200 OK on Admin calling GET /api/admin/stats');
    assert(adminStatsRes.body.stats && typeof adminStatsRes.body.stats.totalUsers === 'number', 'Returns valid admin platform stats');

    // -------------------------------------------------------------
    // TEST 4: Invalid Admin Token -> 401 Unauthorized
    // -------------------------------------------------------------
    console.log('\n--- 4. Invalid Token Check ---');
    const invalidTokenRes = await request('GET', '/api/admin/stats', null, {
      Authorization: 'Bearer invalid-token-string-xyz'
    });
    assert(invalidTokenRes.status === 401, 'HTTP 401 Unauthorized on invalid Bearer token');

    // -------------------------------------------------------------
    // TEST 5: Student Attempting Admin API -> 403 Forbidden
    // -------------------------------------------------------------
    console.log('\n--- 5. Student Accessing Admin Users API ---');
    const studentUsersRes = await request('GET', '/api/admin/users', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(studentUsersRes.status === 403, 'HTTP 403 Forbidden on Student fetching users list');

    // -------------------------------------------------------------
    // TEST 6: Privilege Escalation Prevention
    // -------------------------------------------------------------
    console.log('\n--- 6. Privilege Escalation Prevention ---');
    // Student attempting to change self role via profile update (or auth payload)
    const selfEscalateRes = await request('PUT', '/api/profile', {
      role: 'admin'
    }, { Authorization: `Bearer ${studentToken}` });

    const checkStudentDb = await User.findById(studentUser._id);
    assert(checkStudentDb.role === 'student', 'Student role remains student after privilege escalation attempt');

    // -------------------------------------------------------------
    // TEST 7: Mass Assignment Attempt Protection
    // -------------------------------------------------------------
    console.log('\n--- 7. Mass Assignment Attempt Protection ---');
    const massAssignRes = await request('PUT', `/api/admin/users/${studentUser._id}`, {
      name: 'Updated Student Name',
      password: 'HackedPassword@123',
      passwordHash: 'fakehash'
    }, { Authorization: `Bearer ${adminToken}` });

    assert(massAssignRes.status === 200, 'HTTP 200 OK on Admin updating user details');
    const recheckUser = await User.findById(studentUser._id);
    assert(recheckUser.name === 'Updated Student Name', 'User name updated');
    // Verify login still works with original password (password not overwritten by mass assignment)
    const loginTest = await request('POST', '/api/auth/login', {
      email: 'student_p11@smartskill.com',
      password: 'Password@123'
    });
    assert(loginTest.status === 200, 'User password unchanged after mass assignment attempt');

    // -------------------------------------------------------------
    // TEST 8: Invalid ObjectId Validation -> 400 Bad Request
    // -------------------------------------------------------------
    console.log('\n--- 8. Invalid ObjectId Validation ---');
    const invalidUserRes = await request('GET', '/api/admin/users/invalid-object-id', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(invalidUserRes.status === 400, 'HTTP 400 Bad Request on invalid User ObjectId format');

    const invalidSkillRes = await request('GET', '/api/admin/skills/invalid-skill-id', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(invalidSkillRes.status === 400, 'HTTP 400 Bad Request on invalid Skill ObjectId format');

    // -------------------------------------------------------------
    // TEST 9: User Data Never Exposes Password / Password Hash
    // -------------------------------------------------------------
    console.log('\n--- 9. Sensitive User Data Omission Check ---');
    const getUsersList = await request('GET', '/api/admin/users', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(getUsersList.status === 200, 'HTTP 200 OK on GET /api/admin/users');
    const sampleUser = getUsersList.body.users[0];
    assert(sampleUser && sampleUser.password === undefined && sampleUser.passwordHash === undefined, 'User record completely omits password and passwordHash');

    // -------------------------------------------------------------
    // TEST 10: Full CRUD Validation (Skills & Careers)
    // -------------------------------------------------------------
    console.log('\n--- 10. CRUD Operations Validation ---');
    // 10a. Skill CRUD
    const createSkillRes = await request('POST', '/api/admin/skills', {
      name: 'Admin CRUD Skill P11',
      category: 'Cloud',
      description: 'Cloud skill'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(createSkillRes.status === 201, 'HTTP 201 Created on Admin creating skill');
    const skillId = createSkillRes.body.skill._id;

    const updateSkillRes = await request('PUT', `/api/admin/skills/${skillId}`, {
      name: 'Admin CRUD Skill P11 Updated'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(updateSkillRes.status === 200, 'HTTP 200 OK on Admin updating skill');

    const deleteSkillRes = await request('DELETE', `/api/admin/skills/${skillId}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(deleteSkillRes.status === 200, 'HTTP 200 OK on Admin deleting skill');

    // 10b. Career CRUD
    const createCareerRes = await request('POST', '/api/admin/careers', {
      title: 'Admin CRUD Career P11',
      description: 'Admin career path description',
      category: 'DevOps'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(createCareerRes.status === 201, 'HTTP 201 Created on Admin creating career');
    const careerId = createCareerRes.body.career._id;

    const deleteCareerRes = await request('DELETE', `/api/admin/careers/${careerId}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(deleteCareerRes.status === 200, 'HTTP 200 OK on Admin deleting career');

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 11 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 11 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 11 ADMIN DASHBOARD & SECURITY TESTS PASSED!');
    }

  } catch (err) {
    console.error('❌ Error executing Phase 11 test suite:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    mongoose.connection.close();
  }
};

if (require.main === module) {
  runPhase11Tests();
}

module.exports = runPhase11Tests;
