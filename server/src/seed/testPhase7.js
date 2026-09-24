const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');
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

const runPhase7Tests = async () => {
  console.log('🧪 Starting PHASE 7 Skill Gap Analysis Security Test Suite...\n');

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
    // SETUP: Create two distinct student users (User A & User B)
    // -------------------------------------------------------------
    const regA = await request('POST', '/api/auth/register', {
      name: 'Gap Student A',
      email: 'studentA_p7@smartskill.com',
      password: 'Password@123'
    });
    const tokenA = regA.body.token;
    const userAObj = await User.findOne({ email: 'studentA_p7@smartskill.com' });
    const userAId = userAObj._id;

    const regB = await request('POST', '/api/auth/register', {
      name: 'Gap Student B',
      email: 'studentB_p7@smartskill.com',
      password: 'Password@123'
    });
    const tokenB = regB.body.token;
    const userBObj = await User.findOne({ email: 'studentB_p7@smartskill.com' });
    const userBId = userBObj._id;

    assert(tokenA && tokenB, 'Created test accounts for User A and User B');

    // Create Skills & Career Requirement Setup
    const skillReact = await Skill.create({ name: 'Skill Gap React', category: 'Frontend', description: 'React JS' });
    const skillNode = await Skill.create({ name: 'Skill Gap Node', category: 'Backend', description: 'Node JS' });
    const skillMongo = await Skill.create({ name: 'Skill Gap Mongo', category: 'Database', description: 'MongoDB' });

    const targetCareer = await Career.create({
      title: 'Full Stack Engineer (Phase 7)',
      slug: 'fullstack-engineer-p7',
      description: 'Build web applications',
      category: 'Software Engineering',
      salaryRange: '$100,000 - $150,000 / year'
    });

    // Add CareerSkill requirements:
    // React: requiredLevel 3, priority: critical
    // Node: requiredLevel 4, priority: high
    // Mongo: requiredLevel 2, priority: medium
    await CareerSkill.create({ career: targetCareer._id, skill: skillReact._id, requiredLevel: 3, priority: 'critical' });
    await CareerSkill.create({ career: targetCareer._id, skill: skillNode._id, requiredLevel: 4, priority: 'high' });
    await CareerSkill.create({ career: targetCareer._id, skill: skillMongo._id, requiredLevel: 2, priority: 'medium' });

    // Set target career for User A & User B
    await User.findByIdAndUpdate(userAId, { targetCareer: targetCareer._id });
    await User.findByIdAndUpdate(userBId, { targetCareer: targetCareer._id });

    // Give User A skills: React level 3 (COMPLETED), Node level 2 (MEDIUM_GAP), Mongo level 0 (MEDIUM_GAP)
    await UserSkill.create({ user: userAId, skill: skillReact._id, proficiency: 3, source: 'assessment' });
    await UserSkill.create({ user: userAId, skill: skillNode._id, proficiency: 2, source: 'self' });

    // User B has no skills added yet

    // -------------------------------------------------------------
    // TEST 1: Unauthorized Access (401 Unauthorized)
    // -------------------------------------------------------------
    console.log('\n--- 1. Unauthorized Access ---');
    const unauthRes = await request('GET', '/api/skill-gap');
    assert(unauthRes.status === 401, 'HTTP 401 Unauthorized on GET /api/skill-gap without token');

    // -------------------------------------------------------------
    // TEST 2: User with Target Career & Skills (User A Analysis)
    // -------------------------------------------------------------
    console.log('\n--- 2. Valid User Skill Gap Analysis (User A) ---');
    const gapResA = await request('GET', '/api/skill-gap', null, {
      Authorization: `Bearer ${tokenA}`
    });
    assert(gapResA.status === 200, 'HTTP 200 OK on GET /api/skill-gap');
    assert(gapResA.body.hasTargetCareer === true, 'Returns hasTargetCareer: true');
    assert(gapResA.body.career.title === 'Full Stack Engineer (Phase 7)', 'Returns correct target career details');
    assert(Array.isArray(gapResA.body.skills) && gapResA.body.skills.length === 3, 'Returns all 3 required career skills');

    // Verify calculated gaps & statuses for User A:
    // React (Req 3, Cur 3) -> gap 0, status COMPLETED
    // Node (Req 4, Cur 2) -> gap 2, status MEDIUM_GAP
    // Mongo (Req 2, Cur 0) -> gap 2, status MEDIUM_GAP
    const reactGap = gapResA.body.skills.find(s => s.skill._id === skillReact._id.toString());
    const nodeGap = gapResA.body.skills.find(s => s.skill._id === skillNode._id.toString());
    const mongoGap = gapResA.body.skills.find(s => s.skill._id === skillMongo._id.toString());

    assert(reactGap && reactGap.status === 'COMPLETED' && reactGap.gap === 0, 'React skill status is COMPLETED with gap 0');
    assert(nodeGap && nodeGap.status === 'MEDIUM_GAP' && nodeGap.gap === 2, 'Node skill status is MEDIUM_GAP with gap 2');
    assert(mongoGap && mongoGap.status === 'MEDIUM_GAP' && mongoGap.gap === 2, 'Mongo skill status is MEDIUM_GAP with gap 2');
    assert(typeof gapResA.body.overallSkillCoverage === 'number' && gapResA.body.overallSkillCoverage > 0, 'Server calculated overallSkillCoverage percentage');

    // -------------------------------------------------------------
    // TEST 3: User Isolation & Privacy (User A cannot access User B skills)
    // -------------------------------------------------------------
    console.log('\n--- 3. User Skill Isolation (User B Analysis) ---');
    const gapResB = await request('GET', '/api/skill-gap', null, {
      Authorization: `Bearer ${tokenB}`
    });
    assert(gapResB.status === 200, 'HTTP 200 OK on GET /api/skill-gap for User B');
    const reactGapB = gapResB.body.skills.find(s => s.skill._id === skillReact._id.toString());
    assert(reactGapB && reactGapB.currentLevel === 0 && reactGapB.status === 'HIGH_GAP', 'User B skills isolated: React current level is 0 for User B');

    // -------------------------------------------------------------
    // TEST 4: Fake Current Skills in Body Completely Ignored (Security)
    // -------------------------------------------------------------
    console.log('\n--- 4. Client-Submitted Fake Skills Ignored ---');
    const fakeBodyRes = await request('POST', '/api/skill-gap/analyze', {
      careerId: targetCareer._id.toString(),
      // Attempting to inject fake max skills in request body
      skills: [
        { skill: skillNode._id.toString(), currentLevel: 4 },
        { skill: skillMongo._id.toString(), currentLevel: 4 }
      ]
    }, { Authorization: `Bearer ${tokenA}` });

    assert(fakeBodyRes.status === 200, 'HTTP 200 OK on POST /api/skill-gap/analyze');
    const nodeGapPost = fakeBodyRes.body.skills.find(s => s.skill._id === skillNode._id.toString());
    assert(nodeGapPost && nodeGapPost.currentLevel === 2, 'Node current level is 2 from DB (fake level 4 in body ignored!)');

    // -------------------------------------------------------------
    // TEST 5: Sorting by Priority (Critical > High > Medium > Low) and Gap
    // -------------------------------------------------------------
    console.log('\n--- 5. Priority & Gap Sorting ---');
    const sortedSkills = gapResA.body.skills;
    assert(sortedSkills[0].skill._id === skillReact._id.toString(), 'First skill is React (priority: critical)');
    assert(sortedSkills[1].skill._id === skillNode._id.toString(), 'Second skill is Node (priority: high)');

    // -------------------------------------------------------------
    // TEST 6: User with No Target Career
    // -------------------------------------------------------------
    console.log('\n--- 6. User With No Target Career ---');
    const userNoCareer = await User.create({
      name: 'No Career User',
      email: 'nocareer_p7@smartskill.com',
      password: 'Password@123'
    });
    const loginNoCareer = await request('POST', '/api/auth/login', {
      email: 'nocareer_p7@smartskill.com',
      password: 'Password@123'
    });
    const tokenNoCareer = loginNoCareer.body.token;

    const noCareerRes = await request('GET', '/api/skill-gap', null, {
      Authorization: `Bearer ${tokenNoCareer}`
    });
    assert(noCareerRes.status === 200, 'HTTP 200 OK for user with no target career');
    assert(noCareerRes.body.hasTargetCareer === false, 'Returns hasTargetCareer: false');
    assert(noCareerRes.body.overallSkillCoverage === 0, 'Returns overallSkillCoverage: 0');

    // -------------------------------------------------------------
    // TEST 7: Invalid & Non-Existent Career ID Validation (400 / 404)
    // -------------------------------------------------------------
    console.log('\n--- 7. Invalid & Non-Existent Career ID Validation ---');
    const invalidIdRes = await request('POST', '/api/skill-gap/analyze', {
      careerId: 'invalid-object-id'
    }, { Authorization: `Bearer ${tokenA}` });
    assert(invalidIdRes.status === 400, 'HTTP 400 Bad Request on invalid career ID format');

    const nonExistentIdRes = await request('POST', '/api/skill-gap/analyze', {
      careerId: new mongoose.Types.ObjectId().toString()
    }, { Authorization: `Bearer ${tokenA}` });
    assert(nonExistentIdRes.status === 404, 'HTTP 404 Not Found on non-existent career ID');

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 7 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 7 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 7 SKILL GAP ANALYSIS SECURITY TESTS PASSED!');
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
  runPhase7Tests();
}

module.exports = runPhase7Tests;
