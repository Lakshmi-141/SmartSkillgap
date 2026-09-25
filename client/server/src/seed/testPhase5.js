const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');

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

const runPhase5Tests = async () => {
  console.log('🧪 Starting PHASE 5 Career Explorer & Management Security Test Suite...\n');

  await connectDB();

  // Wait for initial seed data
  let attempts = 0;
  while ((await User.countDocuments()) === 0 && attempts < 50) {
    await new Promise(r => setTimeout(r, 200));
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
    // SETUP: Tokens for Student & Admin
    // -------------------------------------------------------------
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@smartskill.com',
      password: 'Student@123'
    });
    const studentToken = studentLogin.body.token;

    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@smartskill.com',
      password: 'Admin@123'
    });
    const adminToken = adminLogin.body.token;

    assert(studentToken && adminToken, 'Retrieved tokens for Student and Admin');

    const sampleCareer = await Career.findOne();
    const sampleSkill = await Skill.findOne();

    // -------------------------------------------------------------
    // TEST 1: Public Career Access
    // -------------------------------------------------------------
    console.log('\n--- 1. Public Career Access (No Token) ---');
    const pubListRes = await request('GET', '/api/careers');
    assert(pubListRes.status === 200, 'HTTP 200 OK on Public GET /api/careers');
    assert(Array.isArray(pubListRes.body.careers) && pubListRes.body.careers.length > 0, 'Returns careers array publicly');

    const pubSingleRes = await request('GET', `/api/careers/${sampleCareer._id}`);
    assert(pubSingleRes.status === 200, 'HTTP 200 OK on Public GET /api/careers/:id');
    assert(pubSingleRes.body.career.title === sampleCareer.title, 'Returns single career details publicly');

    // -------------------------------------------------------------
    // TEST 2: Student Target Career Selection
    // -------------------------------------------------------------
    console.log('\n--- 2. Student Target Career Selection ---');
    const targetRes = await request('POST', '/api/careers/select-target', {
      careerId: sampleCareer._id.toString()
    }, { Authorization: `Bearer ${studentToken}` });

    assert(targetRes.status === 200, 'HTTP 200 OK when Student sets target career');
    assert(targetRes.body.user.targetCareer._id === sampleCareer._id.toString(), 'Student user targetCareer updated in DB');

    // -------------------------------------------------------------
    // TEST 3: Student Access Restrictions on Career Mutations (403 Forbidden)
    // -------------------------------------------------------------
    console.log('\n--- 3. Student Authorization Restrictions (403 Forbidden) ---');
    const studentCreate = await request('POST', '/api/careers', {
      title: 'Hacked Career Title',
      description: 'Illegal creation'
    }, { Authorization: `Bearer ${studentToken}` });
    assert(studentCreate.status === 403, 'HTTP 403 Forbidden when Student attempts POST /api/careers');

    const studentUpdate = await request('PUT', `/api/careers/${sampleCareer._id}`, {
      title: 'Hacked Career Title'
    }, { Authorization: `Bearer ${studentToken}` });
    assert(studentUpdate.status === 403, 'HTTP 403 Forbidden when Student attempts PUT /api/careers/:id');

    const studentDelete = await request('DELETE', `/api/careers/${sampleCareer._id}`, null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(studentDelete.status === 403, 'HTTP 403 Forbidden when Student attempts DELETE /api/careers/:id');

    // -------------------------------------------------------------
    // TEST 4: Student Access Restrictions on Career Skills (403 Forbidden)
    // -------------------------------------------------------------
    console.log('\n--- 4. Student Authorization Restrictions on Career Skills (403 Forbidden) ---');
    const studentAddSkill = await request('POST', `/api/careers/${sampleCareer._id}/skills`, {
      skillId: sampleSkill._id.toString(),
      requiredLevel: 3,
      priority: 'high'
    }, { Authorization: `Bearer ${studentToken}` });
    assert(studentAddSkill.status === 403, 'HTTP 403 Forbidden when Student attempts POST /api/careers/:id/skills');

    const sampleCareerSkill = await CareerSkill.findOne();
    if (sampleCareerSkill) {
      const studentPutCS = await request('PUT', `/api/career-skills/${sampleCareerSkill._id}`, {
        requiredLevel: 4
      }, { Authorization: `Bearer ${studentToken}` });
      assert(studentPutCS.status === 403, 'HTTP 403 Forbidden when Student attempts PUT /api/career-skills/:id');

      const studentDelCS = await request('DELETE', `/api/career-skills/${sampleCareerSkill._id}`, null, {
        Authorization: `Bearer ${studentToken}`
      });
      assert(studentDelCS.status === 403, 'HTTP 403 Forbidden when Student attempts DELETE /api/career-skills/:id');
    }

    // -------------------------------------------------------------
    // TEST 5: Admin CRUD Operations on Careers & Career Skills
    // -------------------------------------------------------------
    console.log('\n--- 5. Admin CRUD Operations ---');

    // Admin creates career
    const adminCreateRes = await request('POST', '/api/careers', {
      title: 'Robotics Engineer',
      description: 'Design and program robotic systems and autonomous devices.',
      category: 'Artificial Intelligence',
      demand: 'Critical',
      salaryRange: '$110,000 - $170,000 / year'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(adminCreateRes.status === 201, 'HTTP 201 Created on Admin POST /api/careers');
    const createdCareerId = adminCreateRes.body.career._id;

    // Admin updates career
    const adminUpdateRes = await request('PUT', `/api/careers/${createdCareerId}`, {
      title: 'Robotics & Automation Engineer',
      demand: 'Very High'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(adminUpdateRes.status === 200, 'HTTP 200 OK on Admin PUT /api/careers/:id');
    assert(adminUpdateRes.body.career.title === 'Robotics & Automation Engineer', 'Career title updated');

    // Admin adds career skill requirement
    const adminAddSkillRes = await request('POST', `/api/careers/${createdCareerId}/skills`, {
      skillId: sampleSkill._id.toString(),
      requiredLevel: 3,
      priority: 'critical'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(adminAddSkillRes.status === 201, 'HTTP 201 Created on Admin POST /api/careers/:id/skills');
    const createdCSId = adminAddSkillRes.body.careerSkill._id;

    // Admin updates career skill requirement
    const adminUpdateCSRes = await request('PUT', `/api/career-skills/${createdCSId}`, {
      requiredLevel: 4,
      priority: 'high'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(adminUpdateCSRes.status === 200, 'HTTP 200 OK on Admin PUT /api/career-skills/:id');
    assert(adminUpdateCSRes.body.careerSkill.requiredLevel === 4, 'Required level updated to 4');

    // Admin deletes career skill requirement
    const adminDelCSRes = await request('DELETE', `/api/career-skills/${createdCSId}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminDelCSRes.status === 200, 'HTTP 200 OK on Admin DELETE /api/career-skills/:id');

    // Admin deletes created career
    const adminDelCareerRes = await request('DELETE', `/api/careers/${createdCareerId}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminDelCareerRes.status === 200, 'HTTP 200 OK on Admin DELETE /api/careers/:id');

    // -------------------------------------------------------------
    // TEST 6: Invalid Career & Skill IDs Validation (400 Bad Request)
    // -------------------------------------------------------------
    console.log('\n--- 6. Invalid ObjectId Validation ---');
    const invalidCareerGet = await request('GET', '/api/careers/invalid-career-id');
    assert(invalidCareerGet.status === 400, 'HTTP 400 Bad Request on invalid career ID parameter');

    const invalidSkillPost = await request('POST', `/api/careers/${sampleCareer._id}/skills`, {
      skillId: 'invalid-skill-id',
      requiredLevel: 3,
      priority: 'high'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(invalidSkillPost.status === 400, 'HTTP 400 Bad Request on invalid skill ID parameter');

    // -------------------------------------------------------------
    // TEST 7: Validation of requiredLevel (0-4) and priority Enum
    // -------------------------------------------------------------
    console.log('\n--- 7. Level & Priority Enum Validation ---');
    const invalidLevelPost = await request('POST', `/api/careers/${sampleCareer._id}/skills`, {
      skillId: sampleSkill._id.toString(),
      requiredLevel: 99, // Out of range!
      priority: 'high'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(invalidLevelPost.status === 400, 'HTTP 400 Bad Request on requiredLevel = 99');

    const invalidPriorityPost = await request('POST', `/api/careers/${sampleCareer._id}/skills`, {
      skillId: sampleSkill._id.toString(),
      requiredLevel: 2,
      priority: 'super_ultra_high' // Invalid enum!
    }, { Authorization: `Bearer ${adminToken}` });
    assert(invalidPriorityPost.status === 400, 'HTTP 400 Bad Request on invalid priority enum');

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 5 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 5 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 5 CAREER EXPLORER & MANAGEMENT SECURITY TESTS PASSED!');
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
  runPhase5Tests();
}

module.exports = runPhase5Tests;
