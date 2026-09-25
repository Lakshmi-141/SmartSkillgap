const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const CareerSkill = require('../models/CareerSkill');
const UserSkill = require('../models/UserSkill');
const Resource = require('../models/Resource');
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

const runPhase9Tests = async () => {
  console.log('🧪 Starting PHASE 9 Learning Resources & Project Recommendations Security Test Suite...\n');

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
    // SETUP: Create Admin & Student users
    // -------------------------------------------------------------
    const regAdmin = await request('POST', '/api/auth/register', {
      name: 'Phase9 Admin',
      email: 'admin_p9@smartskill.com',
      password: 'Password@123'
    });
    const adminUser = await User.findOne({ email: 'admin_p9@smartskill.com' });
    adminUser.role = 'admin';
    await adminUser.save();
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin_p9@smartskill.com',
      password: 'Password@123'
    });
    const adminToken = adminLogin.body.token;

    const regStudent = await request('POST', '/api/auth/register', {
      name: 'Phase9 Student',
      email: 'student_p9@smartskill.com',
      password: 'Password@123'
    });
    const studentToken = regStudent.body.token;
    const studentUser = await User.findOne({ email: 'student_p9@smartskill.com' });

    assert(adminToken && studentToken, 'Created test accounts for Admin and Student');

    // Create Skills & Career Requirement Setup
    const skillDocker = await Skill.create({ name: 'Docker P9', category: 'DevOps', description: 'Containerization' });
    const skillK8s = await Skill.create({ name: 'Kubernetes P9', category: 'DevOps', description: 'Orchestration' });

    const cloudCareer = await Career.create({
      title: 'DevOps Architect (Phase 9)',
      slug: 'devops-architect-p9',
      description: 'Manage cloud infrastructures',
      category: 'DevOps',
      salaryRange: '$150,000 - $200,000 / year'
    });

    await CareerSkill.create({ career: cloudCareer._id, skill: skillDocker._id, requiredLevel: 3, priority: 'critical' });
    await CareerSkill.create({ career: cloudCareer._id, skill: skillK8s._id, requiredLevel: 4, priority: 'high' });

    await User.findByIdAndUpdate(studentUser._id, { targetCareer: cloudCareer._id });
    await UserSkill.create({ user: studentUser._id, skill: skillDocker._id, proficiency: 1, source: 'assessment' }); // Gap = 2

    // -------------------------------------------------------------
    // TEST 1: Admin Create Resource & Project (Valid http/https URLs)
    // -------------------------------------------------------------
    console.log('\n--- 1. Admin Resource & Project Creation ---');
    const validResourceRes = await request('POST', '/api/resources', {
      title: 'Docker Deep Dive',
      description: 'Master Docker containers',
      url: 'https://docker.com/guide',
      type: 'course',
      skill: skillDocker._id.toString(),
      difficulty: 'intermediate'
    }, { Authorization: `Bearer ${adminToken}` });

    assert(validResourceRes.status === 201, 'HTTP 201 Created on Admin creating valid resource');
    const resourceId = validResourceRes.body.resource._id;

    const validProjectRes = await request('POST', '/api/projects', {
      title: 'K8s Cluster Setup',
      description: 'Deploy Kubernetes cluster',
      difficulty: 'advanced',
      requiredSkills: [skillDocker._id.toString()],
      skillsGained: [skillK8s._id.toString()],
      githubUrl: 'https://github.com/example/k8s-setup',
      demoUrl: 'http://demo.example.com'
    }, { Authorization: `Bearer ${adminToken}` });

    assert(validProjectRes.status === 201, 'HTTP 201 Created on Admin creating valid project');
    const projectId = validProjectRes.body.project._id;

    // -------------------------------------------------------------
    // TEST 2: Student Cannot Modify Resources or Projects (403 Forbidden)
    // -------------------------------------------------------------
    console.log('\n--- 2. Student Authorization Restrictions (403 Forbidden) ---');
    const studentCreateRes = await request('POST', '/api/resources', {
      title: 'Hacked Resource',
      url: 'https://hacked.com',
      type: 'article',
      skill: skillDocker._id.toString()
    }, { Authorization: `Bearer ${studentToken}` });
    assert(studentCreateRes.status === 403, 'HTTP 403 Forbidden on Student creating resource');

    const studentUpdateRes = await request('PUT', `/api/resources/${resourceId}`, {
      title: 'Hacked Resource Title'
    }, { Authorization: `Bearer ${studentToken}` });
    assert(studentUpdateRes.status === 403, 'HTTP 403 Forbidden on Student updating resource');

    const studentDeleteRes = await request('DELETE', `/api/resources/${resourceId}`, null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(studentDeleteRes.status === 403, 'HTTP 403 Forbidden on Student deleting resource');

    const studentCreateProjRes = await request('POST', '/api/projects', {
      title: 'Hacked Project',
      description: 'Hacked'
    }, { Authorization: `Bearer ${studentToken}` });
    assert(studentCreateProjRes.status === 403, 'HTTP 403 Forbidden on Student creating project');

    // -------------------------------------------------------------
    // TEST 3: URL Security & Scheme Rejection (400 Bad Request)
    // -------------------------------------------------------------
    console.log('\n--- 3. URL Security & Scheme Rejection ---');
    
    // 3a. javascript: scheme rejection
    const jsUrlRes = await request('POST', '/api/resources', {
      title: 'XSS Resource',
      description: 'Malicious',
      url: 'javascript:alert("XSS")',
      type: 'article',
      skill: skillDocker._id.toString()
    }, { Authorization: `Bearer ${adminToken}` });
    assert(jsUrlRes.status === 400, 'HTTP 400 Bad Request on javascript: URL scheme');

    // 3b. data: scheme rejection
    const dataUrlRes = await request('POST', '/api/resources', {
      title: 'Data Scheme Resource',
      description: 'Malicious',
      url: 'data:text/html,<script>alert(1)</script>',
      type: 'article',
      skill: skillDocker._id.toString()
    }, { Authorization: `Bearer ${adminToken}` });
    assert(dataUrlRes.status === 400, 'HTTP 400 Bad Request on data: URL scheme');

    // 3c. file: scheme rejection
    const fileUrlRes = await request('POST', '/api/resources', {
      title: 'File Scheme Resource',
      description: 'Local file access attempt',
      url: 'file:///etc/passwd',
      type: 'article',
      skill: skillDocker._id.toString()
    }, { Authorization: `Bearer ${adminToken}` });
    assert(fileUrlRes.status === 400, 'HTTP 400 Bad Request on file: URL scheme');

    // 3d. vbscript: scheme rejection
    const vbUrlRes = await request('POST', '/api/projects', {
      title: 'VBScript Project',
      description: 'Malicious project link',
      githubUrl: 'vbscript:msgbox("XSS")'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(vbUrlRes.status === 400, 'HTTP 400 Bad Request on vbscript: URL in githubUrl');

    // -------------------------------------------------------------
    // TEST 4: Personalized Recommendation API (GET /api/recommendations)
    // -------------------------------------------------------------
    console.log('\n--- 4. Recommendation API & Authenticated Profile ---');
    const recRes = await request('GET', '/api/recommendations', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(recRes.status === 200, 'HTTP 200 OK on GET /api/recommendations');
    assert(recRes.body.hasTargetCareer === true, 'Returns hasTargetCareer: true');
    assert(Array.isArray(recRes.body.recommendedResources), 'Returns recommendedResources array');
    assert(Array.isArray(recRes.body.recommendedProjects), 'Returns recommendedProjects array');

    // Verify recommendations include clear reason
    const firstRecResource = recRes.body.recommendedResources[0];
    assert(firstRecResource && typeof firstRecResource.reason === 'string', 'Recommended resource includes personalized reason text');

    // Attempting to send fake skill gap query in client request (Security Test)
    const fakeRecRes = await request('GET', '/api/recommendations?fakeSkill=100&fakeGap=none', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(fakeRecRes.status === 200, 'HTTP 200 OK on GET /api/recommendations with query params');
    assert(fakeRecRes.body.targetCareer._id === cloudCareer._id.toString(), 'Recommendations calculated strictly from DB profile (fake query ignored)');

    // -------------------------------------------------------------
    // TEST 5: Input Validation & Invalid ObjectId Checks
    // -------------------------------------------------------------
    console.log('\n--- 5. Input Validation & Invalid ObjectId Checks ---');
    const invalidIdRes = await request('GET', '/api/resources/invalid-resource-id-123', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(invalidIdRes.status === 400, 'HTTP 400 Bad Request on invalid resource ID format');

    const nonExistentIdRes = await request('GET', `/api/resources/${new mongoose.Types.ObjectId()}`, null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(nonExistentIdRes.status === 404, 'HTTP 404 Not Found on non-existent resource ID');

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 9 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 9 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 9 LEARNING RESOURCES & RECOMMENDATIONS SECURITY TESTS PASSED!');
    }

  } catch (err) {
    console.error('❌ Error executing Phase 9 test suite:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    mongoose.connection.close();
  }
};

if (require.main === module) {
  runPhase9Tests();
}

module.exports = runPhase9Tests;
