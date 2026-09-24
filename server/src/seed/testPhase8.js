const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');
const UserSkill = require('../models/UserSkill');
const Roadmap = require('../models/Roadmap');

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

const runPhase8Tests = async () => {
  console.log('🧪 Starting PHASE 8 Personalized Career Roadmap Test Suite...\n');

  await connectDB();

  // Wait for DB connection
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
    // SETUP: Create two distinct student users (Student A & Student B)
    // -------------------------------------------------------------
    const regA = await request('POST', '/api/auth/register', {
      name: 'Roadmap Student A',
      email: 'studentA_p8@smartskill.com',
      password: 'Password@123'
    });
    const tokenA = regA.body.token;
    const userAObj = await User.findOne({ email: 'studentA_p8@smartskill.com' });
    const userAId = userAObj._id;

    const regB = await request('POST', '/api/auth/register', {
      name: 'Roadmap Student B',
      email: 'studentB_p8@smartskill.com',
      password: 'Password@123'
    });
    const tokenB = regB.body.token;
    const userBObj = await User.findOne({ email: 'studentB_p8@smartskill.com' });
    const userBId = userBObj._id;

    assert(tokenA && tokenB, 'Created test accounts for Student A and Student B');

    // Create Skills & Career Requirement Setup for Phase 8
    const skillSystemDesign = await Skill.create({ name: 'System Design P8', category: 'Architecture', description: 'Distributed Systems' });
    const skillTypeScript = await Skill.create({ name: 'TypeScript P8', category: 'Frontend', description: 'Type-safe JavaScript' });
    const skillGraphQL = await Skill.create({ name: 'GraphQL P8', category: 'Backend', description: 'API Query Language' });

    const targetCareer = await Career.create({
      title: 'Principal Software Architect (Phase 8)',
      slug: 'principal-architect-p8',
      description: 'Lead technical design and architecture',
      category: 'Software Engineering',
      salaryRange: '$180,000 - $250,000 / year'
    });

    // Add CareerSkill requirements:
    // System Design: requiredLevel 4, priority: CRITICAL
    // GraphQL: requiredLevel 3, priority: HIGH
    // TypeScript: requiredLevel 2, priority: LOW
    await CareerSkill.create({ career: targetCareer._id, skill: skillSystemDesign._id, requiredLevel: 4, priority: 'critical' });
    await CareerSkill.create({ career: targetCareer._id, skill: skillGraphQL._id, requiredLevel: 3, priority: 'high' });
    await CareerSkill.create({ career: targetCareer._id, skill: skillTypeScript._id, requiredLevel: 2, priority: 'low' });

    // Set target career for Student A and Student B
    await User.findByIdAndUpdate(userAId, { targetCareer: targetCareer._id });
    await User.findByIdAndUpdate(userBId, { targetCareer: targetCareer._id });

    // Give Student A skills: TypeScript level 2 (COMPLETED), GraphQL level 1 (gap 2), System Design level 0 (gap 4)
    await UserSkill.create({ user: userAId, skill: skillTypeScript._id, proficiency: 2, source: 'assessment' });
    await UserSkill.create({ user: userAId, skill: skillGraphQL._id, proficiency: 1, source: 'self' });

    // -------------------------------------------------------------
    // TEST 1: Unauthorized Access (401 Unauthorized)
    // -------------------------------------------------------------
    console.log('\n--- 1. Unauthorized Access Checks ---');
    const unauthRes = await request('GET', '/api/roadmaps/my-roadmap');
    assert(unauthRes.status === 401, 'HTTP 401 Unauthorized on GET /api/roadmaps/my-roadmap without token');

    // -------------------------------------------------------------
    // TEST 2: Generate & Fetch Roadmap for Student A (POST /api/roadmaps/generate)
    // -------------------------------------------------------------
    console.log('\n--- 2. Roadmap Generation & Gap Prioritization ---');
    const genResA = await request('POST', '/api/roadmaps/generate', {
      careerId: targetCareer._id.toString()
    }, { Authorization: `Bearer ${tokenA}` });

    assert(genResA.status === 200, 'HTTP 200 OK on POST /api/roadmaps/generate');
    assert(genResA.body.success === true, 'Returns success: true on generate');
    assert(genResA.body.roadmap && genResA.body.roadmap.steps.length === 3, 'Roadmap generated with all 3 required career steps');

    const stepsA = genResA.body.roadmap.steps;

    // Verify Gap Prioritization:
    // First step should be System Design (CRITICAL priority, gap 4)
    // Second step should be GraphQL (HIGH priority, gap 2)
    // Third step should be TypeScript (LOW priority, gap 0 - COMPLETED)
    assert(stepsA[0].priority === 'CRITICAL' || stepsA[0].priority === 'critical', 'First step is CRITICAL priority (System Design)');
    assert(stepsA[0].order === 1, 'First step has order: 1');
    assert(stepsA[0].status === 'NOT_STARTED', 'System Design step status is NOT_STARTED');

    const tsStep = stepsA.find(s => s.skill && s.skill._id === skillTypeScript._id.toString());
    assert(tsStep && tsStep.status === 'COMPLETED' && tsStep.progress === 100, 'TypeScript step initial status is COMPLETED with 100% progress due to 0 gap');

    // -------------------------------------------------------------
    // TEST 3: GET /api/roadmaps/my-roadmap and GET /api/roadmaps/:careerId
    // -------------------------------------------------------------
    console.log('\n--- 3. Fetch Roadmap Endpoints ---');
    const myRoadmapRes = await request('GET', '/api/roadmaps/my-roadmap', null, {
      Authorization: `Bearer ${tokenA}`
    });
    assert(myRoadmapRes.status === 200, 'HTTP 200 OK on GET /api/roadmaps/my-roadmap');
    assert(myRoadmapRes.body.hasTargetCareer === true, 'Returns hasTargetCareer: true');
    assert(myRoadmapRes.body.roadmap.steps.length === 3, 'My Roadmap returns generated steps');

    const byCareerRes = await request('GET', `/api/roadmaps/${targetCareer._id}`, null, {
      Authorization: `Bearer ${tokenA}`
    });
    assert(byCareerRes.status === 200, 'HTTP 200 OK on GET /api/roadmaps/:careerId');
    assert(byCareerRes.body.roadmap.career._id === targetCareer._id.toString(), 'Returns roadmap matching target career ID');

    // -------------------------------------------------------------
    // TEST 4: Update Progress & Status (PUT /api/roadmaps/:stepId)
    // -------------------------------------------------------------
    console.log('\n--- 4. Update Step Progress & Server-Controlled completedAt ---');
    const stepToUpdate = stepsA[0]; // System Design step
    const stepId = stepToUpdate._id;

    // 4a. Start Step (Update progress to 30%)
    const updateRes1 = await request('PUT', `/api/roadmaps/${stepId}`, {
      progress: 30
    }, { Authorization: `Bearer ${tokenA}` });

    assert(updateRes1.status === 200, 'HTTP 200 OK on PUT /api/roadmaps/:stepId (progress: 30)');
    assert(updateRes1.body.step.progress === 30, 'Step progress updated to 30');
    assert(updateRes1.body.step.status === 'IN_PROGRESS', 'Step status automatically set to IN_PROGRESS');
    assert(updateRes1.body.step.completedAt === null, 'completedAt is null when IN_PROGRESS');

    // 4b. Mark Step Completed & Attempt Frontend completedAt Spoofing
    const fakeClientDate = '2000-01-01T00:00:00.000Z';
    const updateRes2 = await request('PUT', `/api/roadmaps/${stepId}`, {
      status: 'COMPLETED',
      completedAt: fakeClientDate // Spoofed frontend timestamp!
    }, { Authorization: `Bearer ${tokenA}` });

    assert(updateRes2.status === 200, 'HTTP 200 OK on PUT /api/roadmaps/:stepId (status: COMPLETED)');
    assert(updateRes2.body.step.status === 'COMPLETED', 'Step status updated to COMPLETED');
    assert(updateRes2.body.step.progress === 100, 'Step progress automatically updated to 100 when COMPLETED');
    assert(updateRes2.body.step.completedAt !== null, 'server set completedAt timestamp');
    assert(updateRes2.body.step.completedAt !== fakeClientDate, 'Server ignored fake frontend completedAt date!');

    // -------------------------------------------------------------
    // TEST 5: Security - IDOR Prevention (Student B cannot edit Student A step)
    // -------------------------------------------------------------
    console.log('\n--- 5. Security: IDOR & Step Ownership Validation ---');
    const idorRes = await request('PUT', `/api/roadmaps/${stepId}`, {
      progress: 0
    }, { Authorization: `Bearer ${tokenB}` });

    assert(idorRes.status === 404, 'HTTP 404 Not Found on attempting to update another student step ID (IDOR blocked!)');

    // Verify Student A step remains COMPLETED
    const checkA = await request('GET', '/api/roadmaps/my-roadmap', null, { Authorization: `Bearer ${tokenA}` });
    const checkAStep = checkA.body.roadmap.steps.find(s => s._id === stepId);
    assert(checkAStep.status === 'COMPLETED', 'Student A step progress unmodified after malicious Student B request');

    // -------------------------------------------------------------
    // TEST 6: Security - Mass Assignment Protection
    // -------------------------------------------------------------
    console.log('\n--- 6. Security: Mass Assignment Protection ---');
    const massAssignRes = await request('PUT', `/api/roadmaps/${stepId}`, {
      progress: 50,
      priority: 'LOW', // Attempting to downgrade step priority
      title: 'Hacked Title',
      order: 99
    }, { Authorization: `Bearer ${tokenA}` });

    assert(massAssignRes.status === 200, 'HTTP 200 OK on step update request');
    assert(massAssignRes.body.step.priority === 'CRITICAL', 'Priority remains CRITICAL (priority tampering ignored)');
    assert(massAssignRes.body.step.title === stepToUpdate.title, 'Title remains original (title tampering ignored)');

    // -------------------------------------------------------------
    // TEST 7: Input Validation & Invalid ObjectIds
    // -------------------------------------------------------------
    console.log('\n--- 7. Input Validation & Invalid ObjectId Checks ---');
    const invalidStepIdRes = await request('PUT', '/api/roadmaps/invalid-step-id-123', {
      progress: 50
    }, { Authorization: `Bearer ${tokenA}` });
    assert(invalidStepIdRes.status === 400, 'HTTP 400 Bad Request on invalid step ID format');

    const invalidCareerIdRes = await request('GET', '/api/roadmaps/invalid-career-id-123', null, {
      Authorization: `Bearer ${tokenA}`
    });
    assert(invalidCareerIdRes.status === 400, 'HTTP 400 Bad Request on invalid career ID format');

    const invalidProgressRes = await request('PUT', `/api/roadmaps/${stepId}`, {
      progress: 150
    }, { Authorization: `Bearer ${tokenA}` });
    assert(invalidProgressRes.status === 400, 'HTTP 400 Bad Request on invalid progress > 100');

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 8 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 8 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 8 PERSONALIZED CAREER ROADMAP TESTS PASSED!');
    }

  } catch (err) {
    console.error('❌ Error executing Phase 8 test suite:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    mongoose.connection.close();
  }
};

if (require.main === module) {
  runPhase8Tests();
}

module.exports = runPhase8Tests;
