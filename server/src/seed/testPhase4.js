const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');

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

const runPhase4Tests = async () => {
  console.log('🧪 Starting PHASE 4 Profile & Skill Management Security Test Suite...\n');

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
    // SETUP: Register Student A & Student B
    // -------------------------------------------------------------
    console.log('--- 1. Setup Student A & Student B Accounts ---');
    const regA = await request('POST', '/api/auth/register', {
      name: 'Student A',
      email: 'studentA_phase4@example.com',
      password: 'PasswordA@123'
    });
    const tokenA = regA.body.token;

    const regB = await request('POST', '/api/auth/register', {
      name: 'Student B',
      email: 'studentB_phase4@example.com',
      password: 'PasswordB@123'
    });
    const tokenB = regB.body.token;

    assert(tokenA && tokenB, 'Registered Student A & Student B successfully');

    const sampleSkill = await Skill.findOne();
    assert(sampleSkill !== null, 'Sample master skill exists');

    // Add skill for Student B
    const addSkillB = await request('POST', '/api/user-skills', {
      skillId: sampleSkill._id.toString(),
      proficiency: 2
    }, { Authorization: `Bearer ${tokenB}` });

    assert(addSkillB.status === 201, 'Student B added skill successfully');
    const userSkillBId = addSkillB.body.userSkill._id;

    // -------------------------------------------------------------
    // TEST: GET Profile (/api/users/profile)
    // -------------------------------------------------------------
    console.log('\n--- 2. GET Profile (/api/users/profile) ---');
    const getProfA = await request('GET', '/api/users/profile', null, {
      Authorization: `Bearer ${tokenA}`
    });
    assert(getProfA.status === 200, 'HTTP 200 OK on GET /api/users/profile');
    assert(getProfA.body.profile.name === 'Student A', 'Returns correct profile data');
    assert(getProfA.body.profile.password === undefined, 'Profile response omits password');

    // -------------------------------------------------------------
    // TEST: Profile Field Whitelisting & Privilege Escalation Prevention
    // -------------------------------------------------------------
    console.log('\n--- 3. Profile Whitelisting & Role Escalation Prevention ---');
    const putProfA = await request('PUT', '/api/users/profile', {
      name: 'Student A Renamed',
      education: 'B.S. Software Engineering',
      interests: ['React', 'Node.js'],
      role: 'admin', // Malicious attempt to escalate role!
      password: 'HackedPassword123' // Malicious attempt to reset password!
    }, { Authorization: `Bearer ${tokenA}` });

    assert(putProfA.status === 200, 'HTTP 200 OK on Profile Update');
    assert(putProfA.body.profile.name === 'Student A Renamed', 'Name updated');
    assert(putProfA.body.profile.education === 'B.S. Software Engineering', 'Education updated');
    assert(putProfA.body.profile.role === 'student', 'Role remains student (Prevented Admin Escalation)');

    const dbUserA = await User.findOne({ email: 'studentA_phase4@example.com' }).select('+password');
    assert(dbUserA.role === 'student', 'Database record role remains student');

    const passwordMatchHacked = await dbUserA.matchPassword('HackedPassword123');
    assert(passwordMatchHacked === false, 'Password was NOT changed via profile update endpoint');

    // -------------------------------------------------------------
    // TEST: Invalid Proficiency Levels (0-4 strictly)
    // -------------------------------------------------------------
    console.log('\n--- 4. Invalid Proficiency Range Validation (0-4 Only) ---');
    const profTooHigh = await request('POST', '/api/user-skills', {
      skillId: sampleSkill._id.toString(),
      proficiency: 5 // Out of range!
    }, { Authorization: `Bearer ${tokenA}` });
    assert(profTooHigh.status === 400, 'HTTP 400 Bad Request on proficiency = 5');

    const profNegative = await request('POST', '/api/user-skills', {
      skillId: sampleSkill._id.toString(),
      proficiency: -1 // Out of range!
    }, { Authorization: `Bearer ${tokenA}` });
    assert(profNegative.status === 400, 'HTTP 400 Bad Request on proficiency = -1');

    const profString = await request('POST', '/api/user-skills', {
      skillId: sampleSkill._id.toString(),
      proficiency: 'invalid_string'
    }, { Authorization: `Bearer ${tokenA}` });
    assert(profString.status === 400, 'HTTP 400 Bad Request on invalid string proficiency');

    // -------------------------------------------------------------
    // TEST: Invalid Skill ID Validation
    // -------------------------------------------------------------
    console.log('\n--- 5. Invalid ObjectId Validation ---');
    const invalidIdPost = await request('POST', '/api/user-skills', {
      skillId: 'invalid-object-id-string',
      proficiency: 2
    }, { Authorization: `Bearer ${tokenA}` });
    assert(invalidIdPost.status === 400, 'HTTP 400 Bad Request on invalid skillId in POST');

    const invalidIdPut = await request('PUT', '/api/user-skills/invalid-object-id', {
      proficiency: 3
    }, { Authorization: `Bearer ${tokenA}` });
    assert(invalidIdPut.status === 400, 'HTTP 400 Bad Request on invalid ID parameter in PUT');

    const invalidIdDelete = await request('DELETE', '/api/user-skills/invalid-object-id', null, {
      Authorization: `Bearer ${tokenA}`
    });
    assert(invalidIdDelete.status === 400, 'HTTP 400 Bad Request on invalid ID parameter in DELETE');

    // -------------------------------------------------------------
    // TEST: IDOR Prevention - Student A modifying/deleting Student B's skill
    // -------------------------------------------------------------
    console.log('\n--- 6. IDOR Prevention Tests (Student A vs Student B) ---');

    // Student A tries to update Student B's skill
    const idorUpdate = await request('PUT', `/api/user-skills/${userSkillBId}`, {
      proficiency: 4
    }, { Authorization: `Bearer ${tokenA}` }); // Student A token!
    assert(idorUpdate.status === 403 || idorUpdate.status === 404, 'HTTP 403/404 when Student A attempts PUT on Student B skill');

    // Student A tries to delete Student B's skill
    const idorDelete = await request('DELETE', `/api/user-skills/${userSkillBId}`, null, {
      Authorization: `Bearer ${tokenA}`
    }); // Student A token!
    assert(idorDelete.status === 403 || idorDelete.status === 404, 'HTTP 403/404 when Student A attempts DELETE on Student B skill');

    // Verify Student B's skill in database remains untouched
    const dbUserSkillB = await UserSkill.findById(userSkillBId);
    assert(dbUserSkillB !== null && dbUserSkillB.proficiency === 2, 'Student B skill record remains untouched in DB');

    // -------------------------------------------------------------
    // TEST: Student B can modify/delete their OWN skill
    // -------------------------------------------------------------
    console.log('\n--- 7. Legitimate Ownership Access (Student B modifying/deleting own skill) ---');
    const ownUpdate = await request('PUT', `/api/user-skills/${userSkillBId}`, {
      proficiency: 3
    }, { Authorization: `Bearer ${tokenB}` });
    assert(ownUpdate.status === 200, 'HTTP 200 OK when Student B updates own skill');
    assert(ownUpdate.body.userSkill.proficiency === 3, 'Student B skill updated to proficiency 3');

    const ownDelete = await request('DELETE', `/api/user-skills/${userSkillBId}`, null, {
      Authorization: `Bearer ${tokenB}`
    });
    assert(ownDelete.status === 200, 'HTTP 200 OK when Student B deletes own skill');

    const dbDeletedB = await UserSkill.findById(userSkillBId);
    assert(dbDeletedB === null, 'Student B skill record deleted from DB');

    // -------------------------------------------------------------
    // TEST: Unauthorized Requests (Missing Token)
    // -------------------------------------------------------------
    console.log('\n--- 8. Unauthorized Requests (No Token) ---');
    const unauthGet = await request('GET', '/api/users/profile');
    assert(unauthGet.status === 401, 'HTTP 401 Unauthorized on GET /api/users/profile without token');

    const unauthGetSkills = await request('GET', '/api/user-skills');
    assert(unauthGetSkills.status === 401, 'HTTP 401 Unauthorized on GET /api/user-skills without token');

    const unauthPostSkill = await request('POST', '/api/user-skills', { skillId: sampleSkill._id, proficiency: 2 });
    assert(unauthPostSkill.status === 401, 'HTTP 401 Unauthorized on POST /api/user-skills without token');

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 4 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 4 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 4 PROFILE & SKILL MANAGEMENT SECURITY TESTS PASSED!');
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
  runPhase4Tests();
}

module.exports = runPhase4Tests;
