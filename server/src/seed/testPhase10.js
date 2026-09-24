const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');
const UserSkill = require('../models/UserSkill');
const AssessmentResult = require('../models/AssessmentResult');
const Roadmap = require('../models/Roadmap');
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

const runPhase10Tests = async () => {
  console.log('🧪 Starting PHASE 10 Progress Tracking & Career Readiness Test Suite...\n');

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
    // SETUP: Create User A & User B
    // -------------------------------------------------------------
    const regA = await request('POST', '/api/auth/register', {
      name: 'Progress Student A',
      email: 'studentA_p10@smartskill.com',
      password: 'Password@123'
    });
    const tokenA = regA.body.token;
    const userAObj = await User.findOne({ email: 'studentA_p10@smartskill.com' });
    const userAId = userAObj._id;

    const regB = await request('POST', '/api/auth/register', {
      name: 'Progress Student B',
      email: 'studentB_p10@smartskill.com',
      password: 'Password@123'
    });
    const tokenB = regB.body.token;
    const userBObj = await User.findOne({ email: 'studentB_p10@smartskill.com' });
    const userBId = userBObj._id;

    assert(tokenA && tokenB, 'Created test accounts for Student A and Student B');

    // Create Skills & Career Setup
    const skillPy = await Skill.create({ name: 'Python P10', category: 'Backend', description: 'Python language' });
    const skillData = await Skill.create({ name: 'Data Analysis P10', category: 'Data', description: 'Pandas & NumPy' });

    const targetCareer = await Career.create({
      title: 'Data Engineer (Phase 10)',
      slug: 'data-engineer-p10',
      description: 'Build data pipelines',
      category: 'Data Science',
      salaryRange: '$120,000 - $160,000 / year'
    });

    await CareerSkill.create({ career: targetCareer._id, skill: skillPy._id, requiredLevel: 4, priority: 'critical' });
    await CareerSkill.create({ career: targetCareer._id, skill: skillData._id, requiredLevel: 4, priority: 'high' });

    // Set target career for User A & User B
    await User.findByIdAndUpdate(userAId, { targetCareer: targetCareer._id });
    await User.findByIdAndUpdate(userBId, { targetCareer: targetCareer._id });

    // -------------------------------------------------------------
    // TEST 1: Incomplete User Data (Readiness Score = 0%)
    // -------------------------------------------------------------
    console.log('\n--- 1. Incomplete User Readiness Calculation (0%) ---');
    const freshResA = await request('GET', '/api/progress', null, {
      Authorization: `Bearer ${tokenA}`
    });

    assert(freshResA.status === 200, 'HTTP 200 OK on GET /api/progress for fresh user');
    assert(freshResA.body.readinessScore === 0, 'Fresh user readiness score is 0%');
    assert(typeof freshResA.body.disclaimer === 'string' && freshResA.body.disclaimer.includes('does not guarantee employment'), 'Response includes mandatory employment disclaimer');

    // -------------------------------------------------------------
    // TEST 2: Partial & Complete User Data Progress Calculation
    // -------------------------------------------------------------
    console.log('\n--- 2. Weighted Progress Calculation (40-20-20-20) ---');
    
    // Give User A full skills (Python level 4, Data level 4 -> Skill Score 100% * 40% = 40%)
    await UserSkill.create({ user: userAId, skill: skillPy._id, proficiency: 4, source: 'assessment' });
    await UserSkill.create({ user: userAId, skill: skillData._id, proficiency: 4, source: 'assessment' });

    // Give User A 100% assessment result
    const Assessment = require('../models/Assessment');
    const dummyAssessment = await Assessment.create({
      title: 'Python Assessment P10',
      description: 'Test Python skills',
      skill: skillPy._id,
      difficulty: 'intermediate'
    });

    await AssessmentResult.create({
      user: userAId,
      assessment: dummyAssessment._id,
      skill: skillPy._id,
      score: 10,
      percentage: 100,
      proficiency: 4
    });

    // Generate Roadmap for User A (Roadmap Score 100% * 20% = 20%)
    const roadmapRes = await request('POST', '/api/roadmaps/generate', { careerId: targetCareer._id.toString() }, { Authorization: `Bearer ${tokenA}` });
    const stepIdA = roadmapRes.body.roadmap.steps[0]._id;

    // Complete all roadmap steps for User A
    for (const step of roadmapRes.body.roadmap.steps) {
      await request('PUT', `/api/roadmaps/${step._id}`, { status: 'COMPLETED' }, { Authorization: `Bearer ${tokenA}` });
    }

    const partialProgressRes = await request('GET', '/api/progress', null, {
      Authorization: `Bearer ${tokenA}`
    });

    assert(partialProgressRes.status === 200, 'HTTP 200 OK on GET /api/progress after completing skills, assessments & roadmap');
    assert(partialProgressRes.body.breakdown.skillCompletion === 100, 'Skill completion breakdown is 100%');
    assert(partialProgressRes.body.breakdown.assessmentPerformance === 100, 'Assessment performance breakdown is 100%');
    assert(partialProgressRes.body.breakdown.roadmapCompletion === 100, 'Roadmap completion breakdown is 100%');
    assert(partialProgressRes.body.readinessScore >= 80, `Calculated weighted readiness score is ${partialProgressRes.body.readinessScore}% (expected >= 80%)`);

    // -------------------------------------------------------------
    // TEST 3: User Isolation & Security (User A cannot access or alter User B)
    // -------------------------------------------------------------
    console.log('\n--- 3. Two-User Security Isolation ---');
    const userBProgress = await request('GET', '/api/progress', null, {
      Authorization: `Bearer ${tokenB}`
    });
    assert(userBProgress.body.readinessScore === 0, 'User B readiness score remains 0% (User A progress isolated)');

    // Attempting IDOR: User B tries to update User A's step ID via PUT /api/progress/:roadmapStepId
    const idorProgressUpdate = await request('PUT', `/api/progress/${stepIdA}`, {
      progress: 0
    }, { Authorization: `Bearer ${tokenB}` });

    assert(idorProgressUpdate.status === 404, 'HTTP 404 Not Found on attempting to update another user step ID (IDOR blocked!)');

    // -------------------------------------------------------------
    // TEST 4: Fake Readiness Submission Defense (Security)
    // -------------------------------------------------------------
    console.log('\n--- 4. Client Fake Readiness Submission Defense ---');
    const fakeScoreRes = await request('POST', '/api/progress', {
      readinessScore: 100,
      readinessPercentage: 100,
      readinessLevel: 'Fake Master'
    }, { Authorization: `Bearer ${tokenB}` });

    assert(fakeScoreRes.status === 200, 'HTTP 200 OK on POST /api/progress');
    assert(fakeScoreRes.body.readinessScore === 0, 'Server ignored fake 100% score submitted in request body!');

    // -------------------------------------------------------------
    // TEST 5: Input Validation & Invalid Step IDs
    // -------------------------------------------------------------
    console.log('\n--- 5. Input Validation & Invalid Step ID Checks ---');
    const invalidStepRes = await request('PUT', '/api/progress/invalid-step-id-123', {
      progress: 50
    }, { Authorization: `Bearer ${tokenA}` });

    assert(invalidStepRes.status === 400, 'HTTP 400 Bad Request on invalid roadmap step ID format');

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 10 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 10 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 10 PROGRESS TRACKING & CAREER READINESS TESTS PASSED!');
    }

  } catch (err) {
    console.error('❌ Error executing Phase 10 test suite:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    mongoose.connection.close();
  }
};

if (require.main === module) {
  runPhase10Tests();
}

module.exports = runPhase10Tests;
