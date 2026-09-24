const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
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

const runPhase6Tests = async () => {
  console.log('🧪 Starting PHASE 6 Skill Assessment System Security Test Suite...\n');

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
    // SETUP: Tokens for Student A, Student B, and Admin
    // -------------------------------------------------------------
    const studentALogin = await request('POST', '/api/auth/login', {
      email: 'student@smartskill.com',
      password: 'Student@123'
    });
    const tokenA = studentALogin.body.token;

    // Register Student B if not exists
    let tokenB;
    const studentBLogin = await request('POST', '/api/auth/login', {
      email: 'studentb_p6@smartskill.com',
      password: 'StudentB@123'
    });
    if (studentBLogin.status === 200) {
      tokenB = studentBLogin.body.token;
    } else {
      const regB = await request('POST', '/api/auth/register', {
        name: 'Student B',
        email: 'studentb_p6@smartskill.com',
        password: 'StudentB@123'
      });
      tokenB = regB.body.token;
    }

    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@smartskill.com',
      password: 'Admin@123'
    });
    const adminToken = adminLogin.body.token;

    assert(tokenA && tokenB && adminToken, 'Retrieved authentication tokens for Student A, Student B, and Admin');

    // Ensure sample skill & assessment exist
    let sampleSkill = await Skill.findOne();
    if (!sampleSkill) {
      sampleSkill = await Skill.create({
        name: 'React.js',
        category: 'Frontend Development',
        description: 'React JavaScript UI library'
      });
    }

    let sampleAssessment = await Assessment.findOne({ skill: sampleSkill._id }).select('+questions.correctAnswer +questions.correctOption');
    if (!sampleAssessment || !sampleAssessment.questions || sampleAssessment.questions.length === 0) {
      sampleAssessment = await Assessment.create({
        title: 'React Fundamentals Quiz',
        description: 'Test your knowledge of React hooks, JSX, and components.',
        skill: sampleSkill._id,
        difficulty: 'intermediate',
        questions: [
          {
            questionText: 'What hook is used for side effects in React?',
            options: ['useState', 'useEffect', 'useContext', 'useReducer'],
            correctAnswer: 1,
            correctOption: 1,
            explanation: 'useEffect handles side-effects like data fetching and subscriptions.'
          },
          {
            questionText: 'What is JSX?',
            options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XHR', 'JavaScript Extra'],
            correctAnswer: 0,
            correctOption: 0,
            explanation: 'JSX stands for JavaScript XML.'
          }
        ]
      });
    }

    // -------------------------------------------------------------
    // TEST 1: Correct Answer Hidden in GET Requests
    // -------------------------------------------------------------
    console.log('\n--- 1. Correct Answer Hidden in GET Requests ---');
    const getListRes = await request('GET', '/api/assessments');
    assert(getListRes.status === 200, 'HTTP 200 OK on GET /api/assessments');
    const firstAss = getListRes.body.assessments[0];
    assert(firstAss.questions.every(q => q.correctAnswer === undefined && q.correctOption === undefined), 'GET /api/assessments omits correctAnswer and correctOption');

    const getSingleRes = await request('GET', `/api/assessments/${sampleAssessment._id}`);
    assert(getSingleRes.status === 200, 'HTTP 200 OK on GET /api/assessments/:id');
    const singleAss = getSingleRes.body.assessment;
    assert(singleAss.questions.every(q => q.correctAnswer === undefined && q.correctOption === undefined), 'GET /api/assessments/:id omits correctAnswer and correctOption');

    // -------------------------------------------------------------
    // TEST 2: Server-Side Scoring & Client Score Ignored
    // -------------------------------------------------------------
    console.log('\n--- 2. Server-Side Scoring & Fake Score Ignored ---');
    const fullAssessment = await Assessment.findById(sampleAssessment._id).select('+questions.correctAnswer +questions.correctOption');
    const targetQ1 = fullAssessment.questions[0];
    const correctAnswersPayload = fullAssessment.questions.map(q => ({
      questionId: q._id.toString(),
      selectedAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption
    }));

    // Send a fake client score/percentage in body to verify it is completely ignored
    const submitRes = await request('POST', `/api/assessments/${sampleAssessment._id}/submit`, {
      score: 9999, // Fake score
      percentage: 100, // Fake percentage
      proficiency: 4, // Fake proficiency
      answers: correctAnswersPayload
    }, { Authorization: `Bearer ${tokenA}` });

    assert(submitRes.status === 201, 'HTTP 201 Created on assessment submission');
    assert(submitRes.body.result.percentage === 100, 'Server calculated 100% score for correct answers');
    assert(submitRes.body.result.proficiency === 4, 'Proficiency level 4 (Expert) calculated for 100%');
    const studentAResultId = submitRes.body.result._id;

    // Verify UserSkill updated in DB
    const studentUser = await User.findOne({ email: 'student@smartskill.com' });
    const userSkillA = await UserSkill.findOne({ user: studentUser._id, skill: sampleAssessment.skill });
    assert(userSkillA && userSkillA.proficiency === 4, 'UserSkill proficiency automatically updated to 4 in DB');

    // -------------------------------------------------------------
    // TEST 3: Reject Fake Question IDs
    // -------------------------------------------------------------
    console.log('\n--- 3. Fake Question ID Rejected ---');
    const fakeQRes = await request('POST', `/api/assessments/${sampleAssessment._id}/submit`, {
      answers: [
        { questionId: new mongoose.Types.ObjectId().toString(), selectedAnswer: 0 }
      ]
    }, { Authorization: `Bearer ${tokenA}` });
    assert(fakeQRes.status === 400, 'HTTP 400 Bad Request when fake question ID is submitted');

    // -------------------------------------------------------------
    // TEST 4: Reject Invalid Answer Index
    // -------------------------------------------------------------
    console.log('\n--- 4. Invalid Answer Index Rejected ---');
    const invalidAnsRes = await request('POST', `/api/assessments/${sampleAssessment._id}/submit`, {
      answers: [
        { questionId: targetQ1._id.toString(), selectedAnswer: 99 } // Index 99 out of bounds
      ]
    }, { Authorization: `Bearer ${tokenA}` });
    assert(invalidAnsRes.status === 400, 'HTTP 400 Bad Request when selectedAnswer index is out of bounds');

    // -------------------------------------------------------------
    // TEST 5: Duplicate Question Submissions Handled / Rejected
    // -------------------------------------------------------------
    console.log('\n--- 5. Duplicate Question Submission Handling ---');
    const dupRes = await request('POST', `/api/assessments/${sampleAssessment._id}/submit`, {
      answers: [
        { questionId: targetQ1._id.toString(), selectedAnswer: 1 },
        { questionId: targetQ1._id.toString(), selectedAnswer: 1 } // Duplicate entry for Q1
      ]
    }, { Authorization: `Bearer ${tokenA}` });
    assert(dupRes.status === 400, 'HTTP 400 Bad Request on duplicate question ID submission');

    // -------------------------------------------------------------
    // TEST 6: IDOR Protection (Student B cannot access Student A results)
    // -------------------------------------------------------------
    console.log('\n--- 6. IDOR Protection on Assessment Results ---');
    const idorRes = await request('GET', `/api/assessments/results/${studentAResultId}`, null, {
      Authorization: `Bearer ${tokenB}`
    });
    assert(idorRes.status === 403, 'HTTP 403 Forbidden when Student B tries to view Student A result');

    const ownerRes = await request('GET', `/api/assessments/results/${studentAResultId}`, null, {
      Authorization: `Bearer ${tokenA}`
    });
    assert(ownerRes.status === 200, 'HTTP 200 OK when Student A views their own result');

    // -------------------------------------------------------------
    // TEST 7: Unauthenticated Submission Rejected
    // -------------------------------------------------------------
    console.log('\n--- 7. Unauthenticated Submission Rejected ---');
    const unauthSub = await request('POST', `/api/assessments/${sampleAssessment._id}/submit`, {
      answers: [{ questionId: targetQ1._id.toString(), selectedAnswer: 1 }]
    });
    assert(unauthSub.status === 401, 'HTTP 401 Unauthorized on submission without token');

    // -------------------------------------------------------------
    // TEST 8: Admin CRUD Protection against Non-Admin
    // -------------------------------------------------------------
    console.log('\n--- 8. Admin CRUD Authorization Checks ---');
    const studentCreateAss = await request('POST', '/api/assessments', {
      title: 'Hacked Assessment',
      description: 'Hacked',
      skill: sampleSkill._id.toString()
    }, { Authorization: `Bearer ${tokenA}` });
    assert(studentCreateAss.status === 403, 'HTTP 403 Forbidden when Student tries POST /api/assessments');

    const studentUpdateAss = await request('PUT', `/api/assessments/${sampleAssessment._id}`, {
      title: 'Hacked Title'
    }, { Authorization: `Bearer ${tokenA}` });
    assert(studentUpdateAss.status === 403, 'HTTP 403 Forbidden when Student tries PUT /api/assessments/:id');

    const studentDelAss = await request('DELETE', `/api/assessments/${sampleAssessment._id}`, null, {
      Authorization: `Bearer ${tokenA}`
    });
    assert(studentDelAss.status === 403, 'HTTP 403 Forbidden when Student tries DELETE /api/assessments/:id');

    // -------------------------------------------------------------
    // TEST 9: Admin Assessment CRUD Operations
    // -------------------------------------------------------------
    console.log('\n--- 9. Admin Assessment CRUD Operations ---');
    const adminCreateAss = await request('POST', '/api/assessments', {
      title: 'Admin Created Test Assessment',
      description: 'Created by Admin during security test',
      skill: sampleSkill._id.toString(),
      difficulty: 'beginner',
      questions: [
        {
          questionText: 'Test Question 1',
          options: ['Opt A', 'Opt B'],
          correctAnswer: 0
        }
      ]
    }, { Authorization: `Bearer ${adminToken}` });
    assert(adminCreateAss.status === 201, 'HTTP 201 Created on Admin POST /api/assessments');
    const newAssId = adminCreateAss.body.assessment._id;

    const adminUpdateAss = await request('PUT', `/api/assessments/${newAssId}`, {
      title: 'Admin Updated Test Assessment Title'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(adminUpdateAss.status === 200, 'HTTP 200 OK on Admin PUT /api/assessments/:id');
    assert(adminUpdateAss.body.assessment.title === 'Admin Updated Test Assessment Title', 'Title updated correctly');

    const adminDelAss = await request('DELETE', `/api/assessments/${newAssId}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminDelAss.status === 200, 'HTTP 200 OK on Admin DELETE /api/assessments/:id');

    // -------------------------------------------------------------
    // TEST 10: Proficiency Brackets Evaluation Verification
    // 0-39%: Beginner (Level 1)
    // 40-69%: Intermediate (Level 2)
    // 70-89%: Advanced (Level 3)
    // 90-100%: Expert (Level 4)
    // -------------------------------------------------------------
    console.log('\n--- 10. Proficiency Level Brackets Verification ---');
    // Create an assessment with 10 questions to easily test percentage brackets
    const tenQArray = [];
    for (let i = 0; i < 10; i++) {
      tenQArray.push({
        questionText: `Bracket Q${i + 1}`,
        options: ['Option A', 'Option B'],
        correctAnswer: 0
      });
    }
    const bracketAss = await Assessment.create({
      title: 'Bracket Test Assessment',
      description: 'Testing score percentage to proficiency mapping',
      skill: sampleSkill._id,
      questions: tenQArray
    });

    // 20% -> Level 1 (Beginner)
    const sub20 = await request('POST', `/api/assessments/${bracketAss._id}/submit`, {
      answers: bracketAss.questions.map((q, idx) => ({ questionId: q._id.toString(), selectedAnswer: idx < 2 ? 0 : 1 }))
    }, { Authorization: `Bearer ${tokenA}` });
    assert(sub20.body.result.percentage === 20 && sub20.body.result.proficiency === 1, '20% score correctly yields Level 1 (Beginner)');

    // 50% -> Level 2 (Intermediate)
    const sub50 = await request('POST', `/api/assessments/${bracketAss._id}/submit`, {
      answers: bracketAss.questions.map((q, idx) => ({ questionId: q._id.toString(), selectedAnswer: idx < 5 ? 0 : 1 }))
    }, { Authorization: `Bearer ${tokenA}` });
    assert(sub50.body.result.percentage === 50 && sub50.body.result.proficiency === 2, '50% score correctly yields Level 2 (Intermediate)');

    // 80% -> Level 3 (Advanced)
    const sub80 = await request('POST', `/api/assessments/${bracketAss._id}/submit`, {
      answers: bracketAss.questions.map((q, idx) => ({ questionId: q._id.toString(), selectedAnswer: idx < 8 ? 0 : 1 }))
    }, { Authorization: `Bearer ${tokenA}` });
    assert(sub80.body.result.percentage === 80 && sub80.body.result.proficiency === 3, '80% score correctly yields Level 3 (Advanced)');

    // Cleanup bracket assessment
    await Assessment.findByIdAndDelete(bracketAss._id);

    // FINAL RESULTS SUMMARY
    console.log('\n==================================================');
    console.log(`📊 PHASE 6 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      console.error('❌ Some Phase 6 tests failed. Please inspect logs above.');
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 6 SKILL ASSESSMENT SYSTEM SECURITY TESTS PASSED!');
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
  runPhase6Tests();
}

module.exports = runPhase6Tests;
